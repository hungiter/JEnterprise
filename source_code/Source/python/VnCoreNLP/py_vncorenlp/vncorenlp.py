import re
import time
import jnius_config
import os
import shutil
import threading
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import json

from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer

import string
import pandas as pd
import ast
from underthesea import word_tokenize, pos_tag
from collections import Counter

# .\.venv\Scripts\activate.bat
# pip freeze > requirements.txt

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend's URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)


def download_model(save_dir='./'):
    # current_path = os.path.abspath(os.getcwd())
    if save_dir[-1] == '/':
        save_dir = save_dir[:-1]
    if os.path.isdir(save_dir + "/models") and os.path.exists(save_dir + '/VnCoreNLP-1.2.jar'):
        print("VnCoreNLP model folder " + save_dir +
              " already exists! Please load VnCoreNLP from this folder!")
    else:
        os.mkdir(save_dir + "/models")
        os.mkdir(save_dir + "/models/dep")
        os.mkdir(save_dir + "/models/ner")
        os.mkdir(save_dir + "/models/postagger")
        os.mkdir(save_dir + "/models/wordsegmenter")
        # jar
        os.system(
            "wget https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/VnCoreNLP-1.2.jar")
        shutil.move("VnCoreNLP-1.2.jar", save_dir + "/VnCoreNLP-1.2.jar")
        # wordsegmenter
        os.system(
            "wget https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/models/wordsegmenter/vi-vocab")
        os.system(
            "wget https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/models/wordsegmenter/wordsegmenter.rdr")
        shutil.move("vi-vocab", save_dir + "/models/wordsegmenter/vi-vocab")
        shutil.move("wordsegmenter.rdr", save_dir +
                    "/models/wordsegmenter/wordsegmenter.rdr")
        # postagger
        os.system(
            "wget https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/models/postagger/vi-tagger")
        shutil.move("vi-tagger", save_dir + "/models/postagger/vi-tagger")
        # ner
        os.system(
            "wget https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/models/ner/vi-500brownclusters.xz")
        os.system(
            "wget https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/models/ner/vi-ner.xz")
        os.system(
            "wget https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/models/ner/vi-pretrainedembeddings.xz")
        shutil.move("vi-500brownclusters.xz", save_dir +
                    "/models/ner/vi-500brownclusters.xz")
        shutil.move("vi-ner.xz", save_dir + "/models/ner/vi-ner.xz")
        shutil.move("vi-pretrainedembeddings.xz", save_dir +
                    "/models/ner/vi-pretrainedembeddings.xz")
        # parse
        os.system(
            "wget https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/models/dep/vi-dep.xz")
        shutil.move("vi-dep.xz", save_dir + "/models/dep/vi-dep.xz")


class VnCoreNLP:
    # def __init__(self, max_heap_size='-Xmx2g', annotators=["wseg", "pos", "ner", "parse"], save_dir='./'):
    #     if save_dir[-1] == '/':
    #         save_dir = save_dir[:-1]
    #     if os.path.isdir(save_dir + "/models") == False or os.path.exists(save_dir + '/VnCoreNLP-1.2.jar') == False:
    #         raise Exception("Please download the VnCoreNLP model!")
    #     jnius_config.add_options(max_heap_size)
    #     self.current_working_dir = os.getcwd()
    #     os.chdir(save_dir)
    #     jnius_config.set_classpath(save_dir + "/VnCoreNLP-1.2.jar")
    #     from jnius import autoclass
    #     javaclass_vncorenlp = autoclass('vn.pipeline.VnCoreNLP')
    #     self.javaclass_String = autoclass('java.lang.String')
    #     self.annotators = annotators
    #     if "wseg" not in annotators:
    #         self.annotators.append("wseg")

    #     self.model = javaclass_vncorenlp(annotators)

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


testText = """
Đón Quý khách tại Vietravel 190 Pasteur, quận 3, thành phố Hồ Chí Minh, khởi hành đi miền Tây theo tuyến cao tốc thành phố Hồ Chí Minh - Trung Lương, Trung Lương - Mỹ Thuận và tuyến cao tốc mới Mỹ Thuận - Cần Thơ ngắm nhìn những cánh đồng lúa và màu xanh vườn tược hai bên đường; Chiêm ngưỡng cầu Mỹ Thuận 2 - Dự án trọng điểm quốc gia có chiều dài 1,9km nối liền tỉnh Vĩnh Long và Tiền Giang.
    Đến bến đò Cô Bắc (Cần Thơ), Quý khách đi đò qua sông tham quan cụm du lịch cộng đồng Cồn Sơn - Ngôi làng du lịch cộng đồng độc đáo giữa lòng phố thị cùng những trải nghiệm đặc biệt:
    Bè Cá 7 Bon - tham quan mô hình nuôi cá lồng bè, “thư viện cá nước ngọt” và nơi bảo tồn những giống cá quý hiếm trên sông Hậu hiền hòa. Thưởng thức sản phẩm làm từ cá thát lát cườm, tận mắt chiêm ngưỡng “cá cung thủ” và trải nghiệm massage chân bằng cá có vảy.
    Quý khách cùng nhau thưởng thức bữa cơm gia đình - mỗi nhà một món ngon với "thực đơn bay" đặc trưng chỉ có ở Cồn Sơn.
    Như được trở về với tuổi thơ từ trải nghiệm làm bánh dân gian Nam Bộ truyền thống (bánh lá mít, bánh kẹp cuốn) qua sự hiện dẫn tận tình của các nghệ nhân chất phác. Thưởng thức những chiếc bánh tự tay làm ra thơm mùi gạo, mùi lá, hòa quyện nước cốt dừa béo ngậy.
    Đoàn dừng chân tham quan vườn trái cây đặc sắc theo mùa: chôm chôm, nhãn, vú sữa, ổi, bưởi… (mỗi mùa mỗi trái).
    Thưởng thức ổi sạch trồng tại vườn và trà hoa đậu biếc; xem các “diễn viên cá” biểu diễn "cá lóc bay" và "cá trê gà" không nơi nào có được.
    Mục sở thị tiết mục “xiếc ếch” thú vị; thưởng thức bánh phu thê nhân mặn (giải nhất bánh ngon Nam Bộ 2015) và sâm sâm giải nhiệt được trồng quanh vườn hòa quyện cùng nước cốt gừng thơm ngon.
    Check-in cùng lá sen “siêu to khổng lồ”. Tham quan, tìm hiểu về "Văn hóa Ghe xuồng Nam Bộ" và mua sắm các sản phẩm OCOP.
    Quay trở về thành phố Cần Thơ, đoàn tiếp tục tham quan:
    Đền thờ vua Hùng - với hình tượng trống đồng cách điệu 18 cánh cung điêu khắc hoa văn đại diện cho 18 đời Hùng Vương (khách tham quan Đền thờ trang phục phù hợp với nơi thờ tự, thứ Hai hàng tuần đền thờ đóng cửa để bảo trì)
    Sau khi dùng bữa tối tại thành phố Cần Thơ, Quý khách tự do dạo phố đêm khám phá “Tây Đô” lung linh sắc màu, ngắm cảnh Cầu Cần Thơ về đêm, check-in Cầu Tình Yêu
    Nghỉ đêm tại Cần Thơ
""".strip()

if __name__ == '__main__':
    download_model(save_dir='.')

    # model.annotate_file(input_file="/home/vinai/Desktop/testvncore/t/input.txt", output_file="output.txt")


class RequestBody(BaseModel):
    text: str


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


model = None
raw_df = None
punctuations = []
unique_tags = []
processe_data_state = {
    "step": "sleep",
    "message": "Sleep",
    "error": ""
}


def data_processed_auto():
    global model, punctuations, raw_df, unique_tags
    # if len(punctuations) == 0 or raw_df == None:
    #     processe_data_state["step"] = "load_data_from_csv"
    #     processe_data_state["message"] = "Đang xử lí dữ liệu từ data mẫu..."
    #     punctuations = set(string.punctuation)
    #     raw_df = pd.read_csv("./Dataset_articles_NoID.csv")
    #     raw_df['Tags'] = raw_df['Tags'].apply(ast.literal_eval)
    #     unique_tags = set(
    #         tag for tags_list in raw_df['Tags'] for tag in tags_list)
    #     print(len(unique_tags))

    # if model is None:  # double check inside lock
    #     processe_data_state["step"] = "load_model"
    #     processe_data_state["message"] = "Đang load model..."
    #     model = VnCoreNLP(
    #         annotators=["wseg", "pos", "ner", "parse"], save_dir='.')
    processe_data_state["step"] = ""
    processe_data_state["message"] = ""


def processe_data():  # Running task at background
    threading.Thread(target=data_processed_auto).start()


processe_data()


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


@app.post("/")
def root(body: RequestBody):
    result = None

    if processe_data_state["step"] != "":
        return {
            "status": "Error",
            "message": processe_data_state["message"]
        }
    text = '.'.join(body.text.split("\n"))
    text = preprocessedText(text)

    # POS tagging
    pos_tags = pos_tag(text)

    # Lấy các danh từ (N, Np, Nc: danh từ thường, riêng, danh từ chỉ loại)
    noun_tags = [word for word, tag in pos_tags if tag in ["N", "Np", "Nc"]]

    # Lọc danh từ có độ dài >= 3 và không chứa số/ký tự lạ
    filtered_nouns = [word for word in noun_tags if len(word) > 2 and word.isalpha()]

    # Loại bỏ trùng lặp và chuẩn hóa
    tags = sorted(set(filtered_nouns), key=lambda x: filtered_nouns.index(x))

    # In danh sách tags gợi ý
    print("Tags đề xuất:")
    for tag in tags:
        print("-", tag)
    # annotation_result = model.annotate_text(text)
    # word_segment_result = model.word_segment(text)

    # # Features Extraction
    # vectorizer = TfidfVectorizer()
    # tfidf_matrix = vectorizer.fit_transform(word_segment_result)
    # features = vectorizer.get_feature_names_out()


    # matched_tags = extract_tags_from_text(text)

    result = {
        # "annotation_result": annotation_result,
        # "features": [f for f in features],
        "tags": tags,
        # "unique_tags": unique_tags,
        # "word_segment_result": word_segment_result
    }

    if result:
        return {
            "status": "Success",
            "message": "Texts Extractor!",
            "result": result
        }
    else:
        return {
            "status": "Error",
            "message": "No data!"
        }


# CPython 3.8
# pip install cython
# pip install CocCocTokenizer

# T = PyTokenizer(load_nontone_data=True)
# # tokenize_option:
# # 	0: TOKENIZE_NORMAL (default)
# #	1: TOKENIZE_HOST
# #	2: TOKENIZE_URL
# print(T.word_tokenize("xin chào, tôi là người Việt Nam", tokenize_option=0))

# # Tokenizer VN - Rust download require
# pip install pyvi
# pip install underthesea
# pip install transformers
