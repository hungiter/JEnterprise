from pymongo import MongoClient
from urllib.parse import quote_plus
from typing import List
from crawler.TourModel import OldTour, Tour, TourInstance
import json
from pymongo import UpdateOne
from tqdm import tqdm  # progress bar

# Cấu hình MongoDB
USER = "admin"
PASS = quote_plus("hungnt121@gmail.com")  # Encode password
HOST = "jenterprise-cluster.50c8w.mongodb.net"
DB_NAME = "JEnterprise"
TOURS_TABLE = "tours"
TOUR_INSTANES_TABLE = "tour_instances"

MONGO_URI = f"mongodb+srv://{USER}:{PASS}@{HOST}/{DB_NAME}?retryWrites=true&w=majority&appName=JENterprise-Cluster"
BATCH_SIZE = 100

# # DEPRECATED
# def update_tours(data: List[OldTour], many=False):
#     # Adjust if using MongoDB Atlas
#     client = MongoClient(MONGO_URI)
#     db = client[DB_NAME]
#     collection = db[TOURS_TABLE]
#     print(f"✅ Đã chọn collection: {collection}")
#     for tour in data:
#         collection.update_one({"tour_code": tour.tour_code}, {
#                               "$set": tour.dict()}, upsert=True)
#     return True


def update_old_tours():
    # Adjust if using MongoDB Atlas
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[TOURS_TABLE]
    documents = collection.find()
    old_tours: List[OldTour] = []
    for item in documents:
        try:
            old_tour = OldTour(**item)
            if old_tour:
                old_tours.append(old_tour)
        except:
            pass
    update_tours_override(data=old_tours)


# Updated Instance && Add news
def update_tours(data: List[OldTour], many=False):
    try:
        print(f"Tours: {data}")
        (tours, tour_instances) = tour_to_new_tour(data)
        # Adjust if using MongoDB Atlas
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        tour_collection = db[TOURS_TABLE]
        tour_instance_collection = db[TOUR_INSTANES_TABLE]

        # Prepare bulk operations for tours
        tour_ops = []
        is_tour_added = False
        is_tour_updated = False
        existing_tour_codes = set(
            tour_collection.distinct(
                "tour_code", {"tour_code": {"$in": [t.tour_code for t in tours]}})
        )
        for tour in tours:
            if tour.tour_code in existing_tour_codes:
                is_tour_updated = True
                # Merge instances into existing document
                tour_ops.append(UpdateOne(
                    {"tour_code": tour.tour_code},
                    {
                        # Update everything except `instances`
                        "$set": tour.dict(exclude={"instances"}),
                        "$addToSet": {
                            # Append new without duplication
                            "instances": {"$each": tour.instances}
                        }
                    }
                ))
            else:
                is_tour_added = True
                tour_ops.append(UpdateOne(
                    {"tour_code": tour.tour_code},
                    {"$set": tour.dict()}
                ))

        # Prepare bulk operations for tour instances
        existing_instance_ids = set(
            tour_collection.distinct(
                "instanceId", {"instanceId": {"$in": [t.instanceId for t in tour_instances]}})
        )
        instance_ops = []
        for instance in tour_instances:
            if instance.instanceId in existing_instance_ids:
                instance_ops.append(UpdateOne(
                    {"tourId": instance.tourId, "instanceId": instance.instanceId},
                    {"$set": instance.dict()},
                    upsert=True
                ))

        if tour_ops:
            message = "Do nothing"
            if is_tour_added == True:
                message = "Added new tours"
                if is_tour_updated == True:
                    message = "Added new tours && Merging tour instances"
            else:
                if is_tour_updated == True:
                    message = "Merging tour instances"

            bulk_write_in_chunks(
                tour_collection, tour_ops, BATCH_SIZE, message)
        if instance_ops:
            bulk_write_in_chunks(
                tour_instance_collection, instance_ops, BATCH_SIZE, "Updating instances")
        return True
    except Exception as e:
        print(e)
        return False


# Overwrite update tours
def update_tours_override(data: List[OldTour], many=False):
    try:
        (tours, tour_instances) = tour_to_new_tour(data)
        # Adjust if using MongoDB Atlas
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        tour_collection = db[TOURS_TABLE]
        tour_instance_collection = db[TOUR_INSTANES_TABLE]
        # Prepare bulk operations for tours
        tour_ops = [
            UpdateOne(
                {"tour_code": tour.tour_code},
                {"$set": tour.dict()},
                upsert=True
            )
            for tour in tours
        ]

        # Prepare bulk operations for tour instances
        instance_ops = [
            UpdateOne(
                {"tourId": instance.tourId, "instanceId": instance.instanceId},
                {"$set": instance.dict()},
                upsert=True
            )
            for instance in tour_instances
        ]

        if tour_ops:
            bulk_write_in_chunks(
                tour_collection, tour_ops, BATCH_SIZE, "Updating tours")

        if instance_ops:
            bulk_write_in_chunks(
                tour_instance_collection, instance_ops, BATCH_SIZE, "Updating instances")

        tour_collection.update_many(
            {},  # Match all documents
            {"$unset": {"calendar": ""}}
        )
        # tour_instance_collection.update_many(
        #     {},  # match all documents
        #     {"$rename": {"leaderIds": "guiderIds"}}
        # )
        return True
    except Exception as e:
        print(e)
        return False


def tour_to_new_tour(old_tours: List[OldTour]):
    new_tours: List[Tour] = []
    tour_instances: List[TourInstance] = []
    for tour in old_tours:
        tour_id = tour.tour_code
        tour_instance_ids: List[str] = []
        for date_str in tour.calendar:
            formatted_date = date_str.replace("-", "")  # yyyyMMdd
            instance_id = f"{tour_id}_{formatted_date}"
            tour_instance = TourInstance(
                instanceId=instance_id,
                startDate=date_str,
                tourId=tour_id
            )
            tour_instances.append(tour_instance)
            tour_instance_ids.append(instance_id)

        new_tour = Tour(
            tour_code=tour_id,
            thumbnail=tour.thumbnail,
            title=tour.title,
            departure=tour.departure,
            duration=tour.duration,
            vehicle=tour.vehicle,
            price=tour.price,
            priceValue=tour.priceValue,
            detail_url=tour.detail_url,
            tag=tour.tag,
            tour_detail=tour.tour_detail,
            instances=tour_instance_ids
        )
        new_tours.append(new_tour)
    return (new_tours, tour_instances)


def bulk_write_in_chunks(collection, operations, batch_size, desc):
    for i in tqdm(range(0, len(operations), batch_size), desc=desc):
        batch = operations[i:i + batch_size]
        collection.bulk_write(batch, ordered=False)
