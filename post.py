import json

from fastapi import FastAPI
from fastapi import Request as iRequest
from uagents import Model
from uagents.envelope import Envelope
from uagents.query import query
from typing import Dict, List
from uagents import Agent, Context
import asyncio
import traceback
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
AGENT_ADDRESS = "agent1q07x6reg37k4wveme09h0ymnqe0d2w9whktajux3kpx66e3r7d0xk9quywx"
 
class Request(Model):
    prompt: str
    wardrobe: Dict[str, List[str]]

async def agent_query(req):
    response = await query(destination=AGENT_ADDRESS, message=req, timeout=15)
    if isinstance(response, Envelope):
        data = json.loads(response.decode_payload())
        return data["text"]
    return response

app = FastAPI()

@app.get("/")
def read_root():
    return "Hello from the Agent controller"


@app.post("/endpoint")
async def make_agent_call(req: iRequest):
    logger.info(f"received request: {req}")
    model = Request.parse_obj(await req.json())
    try:
        res = await agent_query(model)
        return f"successful call - agent response: {res}"
    except Exception:
        logger.info(traceback.format_exc())
        return "unsuccessful agent call"
    
#curl -d '{"prompt": "somethign prompty", "wardrobe": {"rings": ["some ring"]}}' -H "Content-Type: application/json" -X POST http://0.0.0.0:8000/endpoint
