FROM python:3.12-alpine

# Create app directory
WORKDIR /backend

# System deps:
RUN pip install --no-cache-dir "poetry==1.4.0"

# Copy only requirements to cache them in docker layer
COPY poetry.lock pyproject.toml ./

# Project initialization:
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev

# Copy project
COPY . .

# Expose port
EXPOSE 6001

# Run app
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "src.__init__:create_app('Production')"]
