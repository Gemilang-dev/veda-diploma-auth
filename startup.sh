#!/bin/bash
# Masuk ke folder backend
cd veda_backend
# Jalankan Gunicorn dengan Uvicorn worker untuk FastAPI
gunicorn --bind=0.0.0.0 --timeout 600 -k uvicorn.workers.UvicornWorker main:app
