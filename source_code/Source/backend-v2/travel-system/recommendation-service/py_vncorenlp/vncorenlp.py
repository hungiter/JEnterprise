import re
import sys
import time
import jnius_config
import os
import shutil
import threading
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import json

from pydantic import BaseModel
from pymongo.errors import PyMongoError
from pymongo import UpdateOne
from sklearn.feature_extraction.text import TfidfVectorizer

import string
import pandas as pd
import ast
from collections import Counter
from tqdm import tqdm
from underthesea import word_tokenize, pos_tag
from index import cache, clear_terminal, mongo_client, print_new_message
from functools import lru_cache


DB_NAME = "JEnterprise"
TAGS_TABLE = "tags"
cache_name = "article_tags"
model = None
raw_df = None
punctuations = []
unique_tags = []
processe_data_state = {
    "step": "",
    "message": "",
    "error": ""
}


class VnCoreNLP:
    def __init__(self, max_heap_size='-Xmx2g', annotators=["wseg", "pos", "ner", "parse"], save_dir='./'):
        print("🔄 Initializing VnCoreNLP...")

        if save_dir[-1] == '/':
            save_dir = save_dir[:-1]

        if not os.path.isdir(save_dir + "/models") or not os.path.exists(save_dir + '/VnCoreNLP-1.2.jar'):
            raise Exception(
                "❌ Model files missing! Please download the VnCoreNLP model.")

        print("✅ Model files found")

        import jnius_config
        print("⚙️ Setting JVM options...")
        jnius_config.add_options(max_heap_size)

        self.current_working_dir = os.getcwd()
        os.chdir(save_dir)

        print("📁 Setting Java classpath...")
        jnius_config.set_classpath(save_dir + "/VnCoreNLP-1.2.jar")

        from jnius import autoclass
        print("📦 Importing Java classes...")
        javaclass_vncorenlp = autoclass('vn.pipeline.VnCoreNLP')
        self.javaclass_String = autoclass('java.lang.String')

        self.annotators = annotators
        if "wseg" not in annotators:
            self.annotators.append("wseg")

        print("🚀 Creating Java pipeline...")
        self.model = javaclass_vncorenlp(self.annotators)

        print("✅ VnCoreNLP fully initialized.")

    def annotate_text(self, text):
        from jnius import autoclass
        javaclass_Annotation = autoclass('vn.pipeline.Annotation')
        str = self.javaclass_String(text)
        annotation = javaclass_Annotation(str)
        self.model.annotate(annotation)
        dict_sentences = {}
        list_sentences = annotation.toString().split("\n\n")[:-1]
        for i in range(len(list_sentences)):
            list_words = list_sentences[i].split("\n")
            list_dict_words = []
            for word in list_words:
                dict_word = {}
                word = word.replace("\t\t", "\t")
                list_tags = word.split("\t")
                dict_word["index"] = int(list_tags[0])
                dict_word["wordForm"] = list_tags[1]
                dict_word["posTag"] = list_tags[2]
                dict_word["nerLabel"] = list_tags[3]
                if "parse" in self.annotators:
                    dict_word["head"] = int(list_tags[4])
                else:
                    dict_word["head"] = list_tags[4]
                dict_word["depLabel"] = list_tags[5]
                list_dict_words.append(dict_word)
            dict_sentences[i] = list_dict_words
        return dict_sentences

    def word_segment(self, text):
        from jnius import autoclass
        javaclass_Annotation = autoclass('vn.pipeline.Annotation')
        str = self.javaclass_String(text)
        annotation = javaclass_Annotation(str)
        self.model.annotate(annotation)
        list_segmented_sentences = []
        list_sentences = annotation.toString().split("\n\n")[:-1]
        for sent in list_sentences:
            list_words = sent.split("\n")
            list_segmented_words = []
            for word in list_words:
                word = word.replace("\t\t", "\t")
                list_tags = word.split("\t")
                list_segmented_words.append(list_tags[1])
            list_segmented_sentences.append(" ".join(list_segmented_words))
        return list_segmented_sentences

    def print_out(self, dict_sentences):
        for sent in dict_sentences.keys():
            list_dict_words = dict_sentences[sent]
            for word in list_dict_words:
                print(str(word["index"]) + "\t" + word["wordForm"] + "\t" + word["posTag"] +
                      "\t" + word["nerLabel"] + "\t" + str(word["head"]) + "\t" + word["depLabel"])
            print("")

    def annotate_file(self, input_file, output_file):
        os.chdir(self.current_working_dir)
        input_str = self.javaclass_String(input_file)
        output_str = self.javaclass_String(output_file)
        self.model.processPipeline(input_str, output_str, self.annotators)


@lru_cache(maxsize=1)
def get_vncorenlp_instance():
    return VnCoreNLP(
        max_heap_size='-Xmx2g',
        annotators=["wseg", "pos", "ner", "parse"],
        save_dir='.'  # Make sure this contains the .jar and models
    )


def chunked(iterable, chunk_size):
    """Chia iterable thành các phần nhỏ"""
    iterable = list(iterable)  # đảm bảo có thể slicing
    return [iterable[i:i + chunk_size] for i in range(0, len(iterable), chunk_size)]


def save_mongo_tags(tags: list[str]):
    new_tags = set(tags)
    existed_tags = set(get_mongo_tags())
    if len(existed_tags) > 0:
        return

    while True:
        clear_terminal()
        unknown_tags = new_tags - existed_tags
        total_unknown_tags = len(unknown_tags)

        if total_unknown_tags == 0:
            break

        try:
            db = mongo_client[DB_NAME]
            collection = db[TAGS_TABLE]

            chunk_size = total_unknown_tags // 10 or 1
            if chunk_size > 100:
                chunk_size = 100
            tag_chunks = chunked(list(unknown_tags), chunk_size)
            try:
                for chunk in tqdm(tag_chunks, total=len(tag_chunks), desc="Saving Tags", unit="chunk", file=sys.stdout):
                    bulk_ops = [
                        UpdateOne(
                            {"value": tag},
                            {"$set": {"value": tag}},
                            upsert=True
                        )
                        for tag in chunk
                    ]
                    collection.bulk_write(bulk_ops, ordered=False)
                    existed_tags = set(list(existed_tags) + chunk)
            except Exception as e:
                pass

            unknown_tags = new_tags - existed_tags
            total_unknown_tags = len(unknown_tags)
            if total_unknown_tags == 0:
                break
        except Exception as e:
            print(f"❌ MongoDB error while saving tags: {e}")


def get_mongo_tags() -> list[str]:
    try:
        db = mongo_client[DB_NAME]
        collection = db[TAGS_TABLE]

        total_tags = collection.count_documents({})
        if total_tags == 0:
            return []

        chunk_size = min(total_tags // 10 or 1, 10000)
        tags = []
        last_id = None

        with tqdm(total=total_tags, desc="Loading MongoDB.Tags", unit="tag", file=sys.stdout) as progress_bar:
            while True:
                try:
                    query = {"_id": {"$gt": last_id}} if last_id else {}
                    cursor = collection.find(query, {"value": 1}).sort(
                        "_id").limit(chunk_size)

                    chunk = list(cursor)
                    if not chunk:
                        break

                    tags.extend(doc["value"]
                                for doc in chunk if "value" in doc)
                    last_id = chunk[-1]["_id"]
                    progress_bar.update(len(chunk))
                except Exception as e:
                    print(f"❌ MongoDB error while reading tags: {e}")
        return tags
    except Exception as e:
        print(f"❌ MongoDB error while reading tags: {e}")
        return []


def create_nlp_model():
    global model, punctuations, raw_df, unique_tags
    if model is None:  # double check inside lock
        processe_data_state["step"] = "load_model"
        processe_data_state["message"] = "Đang load model..."
        model = get_vncorenlp_instance()

    if len(punctuations) == 0 or raw_df == None:
        punctuations = set(string.punctuation)

        # # DISKCACHE
        # if cache_name in cache:
        #   unique_tags = cache[cache_name]
        # CacheManager
        if cache.has(cache_name):
            unique_tags = cache.get(cache_name)
        else:
            unique_tags = set([])

            unique_tags = set(get_mongo_tags())
            if len(unique_tags) == 0:
                processe_data_state["step"] = "load_data_from_csv"
                processe_data_state["message"] = "Đang xử lí dữ liệu từ data mẫu..."
                raw_df = pd.read_csv("./Dataset_articles_NoID.csv")
                raw_df['Tags'] = raw_df['Tags'].apply(ast.literal_eval)
                unique_tags = set(
                    tag for tags_list in raw_df['Tags'] for tag in tags_list)
                save_mongo_tags(unique_tags)
            # # DISKCACHE
            # cache.set(cache_name, unique_tags, 604800)  # 7 days updated
            # CacheManager
            cache.set(cache_name, unique_tags)
    processe_data_state["step"] = ""
    processe_data_state["message"] = ""
    return True

#  Data preprocessing ==========================


def preprocessedText(text: str) -> str:
    new_text = text
    while "__" in new_text:
        new_text = new_text.replace("__", "_")
    while " _" in new_text:
        new_text = new_text.replace(" _", "_")
    while "_ " in new_text:
        new_text = new_text.replace("_ ", "_")
    while "  " in new_text:
        new_text = new_text.replace("  ", " ")
    return new_text


def normalize(text):
    return re.sub(r'\s+', ' ', text.strip().lower())


def segment_and_normalize(text):
    global model
    segmented = ' '.join(model.word_segment(text))
    return normalize(segmented)


def extract_tags_from_text(text):
    global unique_tags
    normalized_text = segment_and_normalize(text)

    def tag_in_text(tag):
        tag_normalized = normalize(tag)
        return tag_normalized in normalized_text

    return [tag for tag in unique_tags if tag_in_text(tag)]
#  Data preprocessing ==========================


def tag_extractor(input: str):
    result = None

    if processe_data_state["step"] != "":
        return {
            "status": "Error",
            "message": processe_data_state["message"]
        }
    text = '.'.join(input.split("\n"))
    text = preprocessedText(text)

    # Underthesea TAGS ====================================================
    # POS tagging
    pos_tags = pos_tag(text)

    # Lấy các danh từ (N, Np, Nc: danh từ thường, riêng, danh từ chỉ loại)
    noun_tags = [word for word, tag in pos_tags if tag in ["N", "Np", "Nc"]]

    # Lọc danh từ có độ dài >= 3 và không chứa số/ký tự lạ
    filtered_nouns = [word for word in noun_tags if len(
        word) > 2 and word.isalpha()]

    # Loại bỏ trùng lặp và chuẩn hóa
    u_tags = sorted(set(filtered_nouns), key=lambda x: filtered_nouns.index(x))

    # # In danh sách tags gợi ý
    # print("Tags đề xuất:")
    # for tag in u_tags:
    #     print("-", tag)

    # Underthesea TAGS ====================================================

    # Model TAGS ====================================================
    # annotation_result = model.annotate_text(text)
    word_segment_result = model.word_segment(text)

    # Features Extraction
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(word_segment_result)
    features = vectorizer.get_feature_names_out()
    tfidf_df = pd.DataFrame(tfidf_matrix.toarray(), columns=features)
    f_tags = [' '.join(tag.split('_')) for tag in features]
    m_tags = extract_tags_from_text(text)
    # Model TAGS ====================================================

    # Unique TAGS ====================================================
    # Function to remove accents from Vietnamese characters
    def remove_accents(input_str):
        import unicodedata
        nfkd_form = unicodedata.normalize('NFKD', input_str)
        return ''.join([c for c in nfkd_form if not unicodedata.combining(c)])
    unique_tags = list(set(u_tags+f_tags+m_tags))
    unique_tags.sort(key=len, reverse=True)
    whitelist = []
    blacklist = []
    for item in unique_tags:
        if item not in blacklist:
            normalized_item = remove_accents(item.lower())
            whitelist.append(item)
            # Kiểm tra tồn tại
            for other_item in unique_tags:
                normalized_other_item = remove_accents(other_item.lower())
                if normalized_other_item in normalized_item and len(normalized_other_item) < len(normalized_item):
                    if other_item not in blacklist:
                        blacklist.append(other_item)
                        blacklist.sort(key=len, reverse=True)
    word_list = whitelist
    # Unique TAGS ====================================================

    # result = {
    #     # "annotation_result": annotation_result,
    #     # "features": [f for f in features],
    #     "words": word_list,
    #     # "blacklist": blacklist,
    #     # "unique_tags": unique_tags,
    #     # "word_segment_result": word_segment_result
    # }

    result = word_list

    if result:
        return {
            "status": "Success",
            "message": "Texts Extractor!",
            "result": word_list
        }
    else:
        return {
            "status": "Error",
            "message": "No data!",
            "result": []
        }
