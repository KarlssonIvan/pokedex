import db as db
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from threading import Lock
import logging
from urllib.parse import urlencode

app = Flask(__name__, static_folder='static', static_url_path='')  # Adjust path as needed
CORS(app, resources={r"/api/*": {"origins": "*"}})

pokemons = db.get()

for pokemon in pokemons:
    if 'selected' not in pokemon:
        pokemon['selected'] = False

data_lock = Lock()


@app.route('/icon/<name>')
def get_icon_url(name:str):
    return f"https://img.pokemondb.net/sprites/silver/normal/{name}.png"

@app.route('/api/pokemons', methods=['GET'])
def get_pokemons():
    with data_lock:
        # ----- Pagination Parameters -----
        try:
            page = int(request.args.get('page', 1))  # Default to page 1
            page_size = int(request.args.get('page_size', 10))  # Default to 10 pokemons per page
        except ValueError:
            return jsonify({"error": "Page and page_size must be integers."}), 400

        if page < 1 or page_size < 1:
            return jsonify({"error": "Page and page_size must be positive integers."}), 400

        # ----- Sorting Parameters -----
        sort_by = request.args.get('sort_by', 'number')  # Default sort field
        order = request.args.get('order', 'asc').lower()  # Default order

        if sort_by != 'number':
            return jsonify({"error": "Can only sort by 'number'."}), 400

        if order not in ['asc', 'desc']:
            return jsonify({"error": "Order must be 'asc' or 'desc'."}), 400

        # ----- Filtering Parameters -----
        type_filter = request.args.get('type')  # Single type or comma-separated list

        # Process the 'type' filter
        if type_filter:
            # Split comma-separated types and normalize to lowercase
            types = [t.strip().lower() for t in type_filter.split(',') if t.strip()]
        else:
            types = []

        # Apply filtering based on 'type' (matches type_one or type_two)
        if types:
            # Extract available types from the dataset
            available_types = set()
            for pokemon in pokemons:
                if 'type_one' in pokemon and pokemon['type_one']:
                    available_types.add(pokemon['type_one'].lower())
                if 'type_two' in pokemon and pokemon['type_two']:
                    available_types.add(pokemon['type_two'].lower())

            # Identify invalid types
            invalid_types = [t for t in types if t not in available_types]
            if invalid_types:
                return jsonify({"error": f"Invalid type(s): {', '.join(invalid_types)}."}), 400

            # Apply filtering: include pokemons where type_one or type_two matches any of the filter types
            filtered_pokemons = [
                pokemon for pokemon in pokemons
                if (pokemon.get('type_one', '').lower() in types) or
                   (pokemon.get('type_two', '').lower() in types)
            ]
        else:
            # No filtering applied
            filtered_pokemons = pokemons

        # ----- Sorting Logic -----
        try:
            sorted_pokemons = sorted(
                filtered_pokemons,
                key=lambda x: x.get('number', 0),
                reverse=(order == 'desc')
            )
        except TypeError as e:
            return jsonify({"error": f"Error sorting data: {str(e)}"}), 500

        # ----- Pagination Logic -----
        start = (page - 1) * page_size
        end = start + page_size
        paginated_pokemons = sorted_pokemons[start:end]

        if not paginated_pokemons and page != 1:
            return jsonify({"error": "Page number out of range."}), 404

        # ----- Helper Function to Build URLs -----
        def build_url(page_number):
            query_params = request.args.to_dict(flat=False)
            query_params['page'] = [page_number]
            # Flatten the list for urlencode
            flattened_params = {}
            for key, values in query_params.items():
                if len(values) == 1:
                    flattened_params[key] = values[0]
                else:
                    flattened_params[key] = values  # Keep as list for multiple params
            return f"{request.base_url}?{urlencode(flattened_params, doseq=True)}"

        # ----- Prepare Response -----
        total_items = len(filtered_pokemons)
        total_pages = (total_items + page_size - 1) // page_size  # Ceiling division

        response = {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "sort_by": sort_by,
            "order": order,
            "types_filter": types,
            "next_page": build_url(page + 1) if page < total_pages else None,
            "previous_page": build_url(page - 1) if page > 1 else None,
            "pokemons": paginated_pokemons
        }

        return jsonify(response), 200
    
@app.route('/api/pokemons/<int:pokemon_id>/toggle_selection', methods=['POST'])
def toggle_selection(pokemon_id):
    with data_lock:
        # Find the pokemon by id
        pokemon = next((p for p in pokemons if p['number'] == pokemon_id), None)
        if not pokemon:
            return '', 404  # 404 Not Found

        # Toggle the selection status
        pokemon['selected'] = not pokemon['selected']

        # Return appropriate HTTP status code without any content
        return jsonify(pokemon), 200 # 204 No Content

@app.route('/api/pokemons/types', methods=['GET'])
def get_pokemon_types():
    """
    Endpoint to retrieve all unique Pokémon types.
    Returns:
        JSON response with a list of unique types.
    """
    try:
        types_set = set()

        for pokemon in pokemons:
            type_one = pokemon.get('type_one')
            type_two = pokemon.get('type_two')

            if type_one:
                types_set.add(type_one.strip().lower())

            if type_two:
                types_set.add(type_two.strip().lower())

        # Convert set to sorted list
        types_list = sorted(list(types_set))

        return jsonify({'types': types_list}), 200

    except Exception as e:
        return jsonify({'error': 'Internal Server Error'}), 500

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
       
if __name__=='__main__':
    app.run(port=8080)