def save_cache_to_file(data, filename='cache.json'):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(data)
    print(f"Cache data saved to {filename}")