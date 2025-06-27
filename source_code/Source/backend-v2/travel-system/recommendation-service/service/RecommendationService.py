import json
from bson.json_util import dumps
from typing import List, Optional

from fastapi.responses import JSONResponse
from pydantic import BaseModel
from index import cache
from service.FeatureExtractorService import tour_features_cache, dict_to_tour_feature_model
from models.TourModel import TourFeature

similarity_matrix = {}
tour_dict = {}


class SimilarityInfo(BaseModel):
    tour: TourFeature
    similarity: float = 0.0  # Maybe 0.0 similar with all


class RecommendResult(BaseModel):
    input: Optional[TourFeature] = None
    detail: List[SimilarityInfo] = []
    summary: List[str] = []
    is_similar: bool = False

# Function to calculate Jaccard similarity between two sets


def jaccard_similarity(set1: set, set2: set) -> float:
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    return intersection / union if union != 0 else 0

# Function to calculate similarity between two tours based on locations and activities


def calculate_similarity(tour1: TourFeature, tour2: TourFeature) -> float:
    # Jaccard similarity for locations
    loc_similarity = jaccard_similarity(
        set(loc.lower() for loc in tour1.locations),
        set(loc.lower() for loc in tour2.locations)
    )

    # Jaccard similarity for activities
    act_similarity = jaccard_similarity(
        set(tour1.activities), set(tour2.activities))

    # Combine similarities (average for simplicity, can weight them)
    return (loc_similarity + act_similarity) / 2

# Function to create an item-based similarity matrix


def create_similarity_matrix():
    global similarity_matrix

    tours = []
    # # DISKCACHE
    # if tour_features_cache in cache:
    #     data = cache[tour_features_cache]
    # CacheManager
    if cache.has(tour_features_cache):
        data = cache.get(tour_features_cache)
        for item in data:
            tour = dict_to_tour_feature_model(item)
            if tour:
                tour_dict[tour.tour_code] = tour
                tours.append(tour)

    for tour1 in tours:
        similarity_matrix[tour1.tour_code] = {}
        for tour2 in tours:
            if tour1.tour_code != tour2.tour_code:  # Don't compare the tour with itself
                similarity = calculate_similarity(tour1, tour2)
                similarity_matrix[tour1.tour_code][tour2.tour_code] = similarity


def get_top_n_similar_tours_result(tour_code: str, n: int = 3):
    try:
        if tour_code not in similarity_matrix:
            return None

        # Get the similarities for the given tour
        similar_tours = similarity_matrix[tour_code]

        # Sort by similarity (highest first) and get top N
        sorted_similar_tours = sorted(
            similar_tours.items(), key=lambda x: x[1], reverse=True)

        # Get top N similar tours by their tour code
        similar_tour = [tour_code for tour_code, _ in sorted_similar_tours[:n]]
        top_n_similar = [tour for tour in sorted_similar_tours[:n]]
        is_similar = any(score > 0 for _, score in top_n_similar)
        similar_infos: List[SimilarityInfo] = []
        for similar_item in top_n_similar:
            tour = tour_dict[similar_item[0]]
            similarity = similar_item[1]
            similar_info = SimilarityInfo(
                tour=tour,
                similarity=similarity
            )
            similar_infos.append(similar_info)

        recommend_result = RecommendResult(
            input=tour_dict[tour_code],
            detail=similar_infos,
            summary=similar_tour,
            is_similar=is_similar
        )
        return recommend_result
    except Exception as e:
        return None


def get_top_n_similar_tours(tour_code: str, n: int = 3):
    try:
        recommend_result = get_top_n_similar_tours_result(tour_code, n)
        if not recommend_result:
            return JSONResponse(content=json.loads(json.dumps({"status": "error", "message": f"Tour with code {tour_code} not found in similarity matrix."})))
        return JSONResponse(content=json.loads(dumps({"status": "success", "data": recommend_result.dict()})))
    except Exception as e:
        return JSONResponse(content=json.loads(dumps({"status": "error", "error": f"{e}"})))


def tour_recommendation(tourId: str, userId: str):
    # GET FAVORITE ONES
    similar_tour = get_top_n_similar_tours(tourId)

    return "HAHA"


def tour_recommendation_by_tours(tour_ids: List[str], ignore_ids: List[str]):
    try:
        gen_similar_tours = [get_top_n_similar_tours_result(
            tour_id, 3) for tour_id in tour_ids if tour_id]
        similar_tours = [
            similar_tour for similar_tour in gen_similar_tours if similar_tour]
        result_tour: RecommendResult = None
        if similar_tours:
            details: List[SimilarityInfo] = []
            summaries: List[str] = []
            is_similar = False
            for similar_tour in similar_tours:
                for idx, detail in enumerate(similar_tour.detail):
                    if (detail.tour.tour_code not in ignore_ids):
                        summary = similar_tour.summary[idx]
                        detail.tour = TourFeature(
                            tour_code=detail.tour.tour_code)
                        if summary:
                            if summary not in summaries:
                                details.append(detail)
                                summaries.append(summary)
                            else:
                                sum_idx = summaries.index(summary)
                                if sum_idx:
                                    old_detail = details[sum_idx]
                                    if old_detail:
                                        if old_detail.similarity < detail.similarity:
                                            details[sum_idx] = detail
            is_similar = any(score > 0 for score in [
                             s.similarity for s in details])
            result_tour = RecommendResult(
                detail=details,
                summary=summaries,
                is_similar=is_similar
            )

        if not result_tour:
            return JSONResponse(content=json.loads(json.dumps({"status": "error", "message": "There haven't any similar tours."})))
        return JSONResponse(content=json.loads(dumps({"status": "success", "data": result_tour.dict()})))
    except Exception as e:
        return JSONResponse(content=json.loads(dumps({"status": "error", "error": f"{e}"})))


def get_similar_matrix():
    if not similarity_matrix:
        return JSONResponse(content=json.loads(json.dumps({"status": "error", "message": "Similarity Matrix not created"})))
    return JSONResponse(content=json.loads(dumps({"status": "success", "data": similarity_matrix})))
