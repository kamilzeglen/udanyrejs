from dotenv import load_dotenv

from flask import jsonify, Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager


# App initialization
def create_app(mode="Development"):

    app = Flask(__name__)

    # Mode
    print("Running in {} mode".format(mode))

    # Config
    load_dotenv()
    app.config.from_object("src.config.{}Config".format(mode))

    # Extensions
    CORS(app, supports_credentials=True)

    @app.route("/health_check")
    def health_check():
        return jsonify("OK"), 200

    return app
