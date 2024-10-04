from datetime import timedelta
import os


class Config(object):
    # Project
    PROJECT_NAME = "UdanyRejs"
    PROJECT_VERSION = "1.0.0"
    PROJECT_DESCRIPTION = ""
    PROJECT_AUTHOR = "Kamil Żegleń"

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY")

    # SQLALCHEMY
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_POOL_SIZE = 50000
    SQLALCHEMY_MAX_OVERFLOW = 50000

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_COOKIE_SECURE = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)



    # CORS
    CORS_HEADERS = "Content-Type"

    # Email
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 465
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_USE_TLS = False
    MAIL_USE_SSL = True
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_USERNAME")
    MAIL_SUPPRESS_SEND = False


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    DEBUG = True
    TESTING = True


class TestingConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    DEBUG = True
    TESTING = True
