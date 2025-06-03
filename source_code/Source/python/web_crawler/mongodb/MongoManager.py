from pymongo import MongoClient
from urllib.parse import quote_plus
from typing import Collection, List
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
TOUR_INSTANCES_TABLE = "tour_instances"

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
        print("Data processing before updated to MongoDB...")
        (tours, tour_instances) = tour_to_new_tour(data)
        # if tours and tour_instances:
        #     print(f"Tours: {data}")
        #     print(f"Tours: {tours}")
        #     print(f"Tours: {tour_instances}")

        # Adjust if using MongoDB Atlas
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        tour_collection = db[TOURS_TABLE]
        tour_instance_collection = db[TOUR_INSTANCES_TABLE]

        print("Prepared data for updated to MongoDB...")
        # Prepare bulk operations for tours
        tour_ops = []
        is_tour_added = False
        is_tour_updated = False
        existing_tour_codes = set(
            tour_collection.distinct(
                "tour_code", {"tour_code": {"$in": [t.tour_code for t in tours]}})
        )

        # Prepare bulk operations for tour instances
        instance_ops = []
        existing_instance_ids = set(
            tour_instance_collection.distinct(
                "instanceId", {"instanceId": {"$in": [t.instanceId for t in tour_instances]}})
        )

        print("Tour prepare...")

        def create_tour_ops(tour: Tour):
            nonlocal is_tour_added, is_tour_updated
            try:
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
                    # tour_ops.append(UpdateOne(
                    #     {"tour_code": tour.tour_code},
                    #     {"$set": tour.dict()}
                    # ))
                    tour_ops.append(  # ---
                        UpdateOne(  # -----
                            {"tour_code": tour.tour_code},
                            {"$set": tour.dict()},
                            upsert=True
                        )  # -----
                    )
                return True
            except Exception as e:
                return False

        def create_instance_ops(instance: TourInstance):
            try:
                if instance.instanceId not in existing_instance_ids:
                    instance_ops.append(UpdateOne(
                        {"tourId": instance.tourId,
                            "instanceId": instance.instanceId},
                        {"$set": instance.dict()},
                        upsert=True
                    ))
                return True
            except Exception as e:
                return False

        check_tour = [create_tour_ops(tour) for tour in tqdm(
            tours, desc="Tours prepare", unit="") if tour]

        if check_tour:
            print(f"Tour_ops: {len(tour_ops)}")
            if tour_ops:
                message = "Do nothing"
                if is_tour_added == True:
                    message = "Added new tours"
                    if is_tour_updated == True:
                        message = "Added new tours && Merging tour instances"
                else:
                    if is_tour_updated == True:
                        message = "Merging tour instances"

                if message != "Do nothing":
                    bulk_write_in_chunks(
                        tour_collection, tour_ops, BATCH_SIZE, message)
                else:
                    print("Aren't have any tours to updated")

            check_instance = [create_instance_ops(instance) for instance in tqdm(
                tour_instances, desc="Instances prepare", unit="") if instance]
            if check_instance:
                if instance_ops:
                    print(f"Instance_ops: {len(instance_ops)}")
                    bulk_write_in_chunks(
                        tour_instance_collection, instance_ops, BATCH_SIZE, "Updating instances")
                else:
                    print("Aren't have any instances to updated")

            else:
                return False
        else:
            return False
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
        tour_instance_collection = db[TOUR_INSTANCES_TABLE]
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

    def processed(tour: OldTour):
        tour_id = tour.tour_code
        tour_instance_ids: List[str] = []

        def instances_processed(date_str: str):
            formatted_date = date_str.replace("-", "")  # yyyyMMdd
            instance_id = f"{tour_id}_{formatted_date}"
            tour_instance = TourInstance(
                instanceId=instance_id,
                startDate=date_str,
                tourId=tour_id
            )
            tour_instances.append(tour_instance)
            tour_instance_ids.append(instance_id)
            return True
        check_instances = [instances_processed(date_str) for date_str in tqdm(
            tour.calendar, desc=f"{tour_id}'s instances processing", unit="") if date_str]

        if check_instances:
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
            return True
        else:
            return False
    check_tours = [processed(tour) for tour in tqdm(
        old_tours, desc="Tours processing", unit="") if tour]
    if check_tours:
        return (new_tours, tour_instances)
    else:
        return ([], [])


def bulk_write_in_chunks(collection: Collection, operations, batch_size, desc):
    for i in tqdm(range(0, len(operations), batch_size), desc=desc):
        try:
            batch = operations[i:i + batch_size]
            # print(f"\n\nBATCH\n{batch}\n")
            collection.bulk_write(batch, ordered=False)
        except Exception as e:
            print(e)


# DB INFORMATION CHECKING FUNCTIONS
def check_distinct_tour_id_in_instances():
    # Adjust if using MongoDB Atlas
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    tour_instance_collection = db[TOUR_INSTANCES_TABLE]
    existing_tourId = tour_instance_collection.distinct("tourId")
    print(f"Total tours in 'tour_instances': {len(existing_tourId)}")
    return existing_tourId


def check_distinct_tour_id_in_tours():
    # Adjust if using MongoDB Atlas
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    tour_collection = db[TOURS_TABLE]
    existing_tour_code = tour_collection.distinct("tour_code")
    print(f"Total tours in 'tours': {len(existing_tour_code)}")
    return existing_tour_code


def validate_instance_tours():
    a = check_distinct_tour_id_in_instances()
    b = check_distinct_tour_id_in_tours()
    missing_tours = [item for item in a if item not in b]
    print(missing_tours)

    # Remove missing tour in instance
    if missing_tours:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        tour_instance_collection = db[TOUR_INSTANCES_TABLE]
        result = tour_instance_collection.delete_many(
            {"tourId": {"$in": missing_tours}})
        print(f"Deleted {result.deleted_count} documents from 'instances'")
    else:
        print("No missing tours to delete.")


def update_instances_status(): # Updated instances without STATUS
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    tour_instance_collection = db[TOUR_INSTANCES_TABLE]
    result = tour_instance_collection.update_many(
        {"status": {"$exists": False}},  # Only instances without 'status'
        {"$set": {"status": "PENDING"}}
    )
    print(
        f"Updated {result.modified_count} tour instances with status='PENDING'")
