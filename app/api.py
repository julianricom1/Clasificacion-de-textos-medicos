from typing import Any
from openai import OpenAI
import os

###
# import textclf_logreg as clasificador
import textclf_svm as clasificador
from fastapi import APIRouter, HTTPException
from loguru import logger

# from model import __version__ as model_version
# from model.predict import make_prediction
from app import __version__, schemas
from app.config import settings

MODEL_VERSION = "0.1.0"
###

# Initialize OpenAI client
client = OpenAI(
    # This is the default and can be omitted
    api_key='sk-...',
    #api_key=os.environ.get("OPENAI_API_KEY"),
)

api_router = APIRouter()


# Ruta para verificar que la API se esté ejecutando correctamente
@api_router.get("/health", response_model=schemas.Health, status_code=200)
def health() -> dict:
    """
    Root Get
    """
    health = schemas.Health(
        name=settings.PROJECT_NAME, api_version=__version__, model_version=MODEL_VERSION
    )

    return health.dict()


# Ruta para realizar las predicciones
@api_router.post("/predict", response_model=schemas.PredictionResults, status_code=200)
async def predict(input_data: schemas.MultipleDataInputs) -> Any:
    texts = [str(t) for t in input_data.inputs]
    logger.info(f"Making prediction on inputs: {texts}")

    try:
        output = clasificador.predict(texts)
    except Exception as e:
        logger.warning(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
    logger.info(f"outputs: {output['scores']}")

    metrics = clasificador.metrics()
    return {
        "predictions": output["labels"],
        "scores": output["scores"],
        "errors": None,
        "version": MODEL_VERSION,
        "metadata": {
            "model_version": MODEL_VERSION,
            "metrics": {
                "accuracy": metrics["accuracy"],
                "recall": metrics["recall"],
                "f1_score": metrics["f1"],
                "pr_auc": metrics["pr_auc"],
                "roc_auc": metrics["roc_auc"],
            },
        },
    }


@api_router.post("/generate", response_model=schemas.PredictionResults, status_code=200)
async def generate(input_data: schemas.MultipleDataInputs) -> Any:
    texts = [str(t) for t in input_data.inputs]
    logger.info(f"Making generation on inputs: {texts}")

    try:
        # Call OpenAI API to generate text based on classification
        generated_texts = []
        for i, text in enumerate(texts):
            
            # Create prompt based on classification result
            prompt = f"""
            Based on the medical text classification result:
            
            Original text: "{text}"
            
            Generate a brief explanation about this medical text classification and provide suggestions for improvement if needed.
            """
            
            try:
                response = client.responses.create(
                    model="gpt-4o",
                    instructions= "You are a medical text analysis assistant that helps explain text classifications and provides improvement suggestions.",
                    input= prompt,
                    temperature=0.7
                )
                
                generated_text = response.output_text
                generated_texts.append(generated_text)
                
            except Exception as openai_error:
                logger.warning(f"OpenAI API error: {openai_error}")
                
    except Exception as e:
        logger.warning(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}")

    metrics = clasificador.metrics()
    return {
        "generation": generated_texts,
        "errors": None,
        "version": MODEL_VERSION,
        "metadata": {
            "model_version": MODEL_VERSION,
            "metrics": {
                "accuracy": metrics["accuracy"],
                "recall": metrics["recall"],
                "f1_score": metrics["f1"],
                "pr_auc": metrics["pr_auc"],
                "roc_auc": metrics["roc_auc"],
            },
        },
    }
