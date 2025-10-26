import os, json, random

_cache = {}

def retrieve_image_url(visuals):
    path = os.path.join("scraped-data", f"{visuals}-results.json")
    if path not in _cache:
        with open(path, "r", encoding="utf-8") as f:
            _cache[path] = json.load(f)
    data = _cache[path]
    if isinstance(data, list) and data:
        selected_item = random.choice(data)
        return selected_item.get("img")  # Return only the URL
    raise Exception("Data not found. Perhaps \"Visuals\" is not found in scraped-data folder?")


if __name__ == "__main__":
    print(retrieve_image_url("girl selfie"))