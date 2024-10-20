from typing import Dict, List
from uagents import Agent, Context, Model
import asyncio
import os
import requests
from PIL import Image
from io import BytesIO
import base64
import time

class Request(Model):
    prompt: str
    wardrobe: Dict[str, List[str]]

class Response(Model):
    outfit: List[List[str]]

class SendRequest(Model):
    prompt: str

class UpdateRequest(Model):
    category_name: str
    image_path: str

class ClearRequest(Model):
    clear: bool

class StatusResponse(Model):
    status: bool

class PrintWardrobeRequest(Model):
    print: bool



WARDROBE = {}

# API information
api = "https://api.hyperbolic.xyz/v1/chat/completions"
api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ3c29uZzkwMDBAZ21haWwuY29tIiwiaWF0IjoxNzI5Mzg4ODQ1fQ.sKvYYt5hqY6Uoqf_imbWWxeXSpGcEgDTON3BKY7r9g0"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

def encode_image(img):
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    encoded_string = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return encoded_string

def image_to_text(image_path: str) -> str:
    image_path = "public/uploads/" + image_path
    try:
        img = Image.open(image_path)
        base64_img = encode_image(img)
        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "What is this wardrobe item? Give me description of itself, its style and how can you pair it. Ignore the background and other irrelevant information. Limit the word to 50 words and make sure the descriptions are in a single not segmented text paragraph."
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"},
                        },
                    ],
                }
            ],
            "model": "meta-llama/Llama-3.2-90B-Vision-Instruct",
            "max_tokens": 512,
            "temperature": 0.5,
            "top_p": 0.9,
        }
        response = requests.post(api, headers=headers, json=payload)

        # Print the response
        if response.status_code == 200:
            result = response.json()
            description = result["choices"][0]["message"]["content"]
            return description
        else:
            print(f"Error processing {image_path}")

    except Exception as e:
        print(f"Error opening or processing {image_path}: {str(e)}")
    return ""

agent = Agent(
    name="ImageAgent",
    port=8000,
    endpoint="http://localhost:8000/submit",
    mailbox="c7ed4c6f-deab-4fa4-a87a-abd0f8ac5718",
    seed="image_agent_1234567890"
)

@agent.on_event("startup")
def send_message(ctx: Context):
    ctx.logger.info("Starting agent...")
    ctx.logger.info(ctx.address)

AI_AGENT_ADDRESS = "agent1qgr6sxjr5ygnwrfm2wzl6dp0lwk95ggndfrjky6cttceeuyc6m8vv76pu0t"

@agent.on_message(Response)
async def handle_response(ctx: Context, sender: str, msg: Response):
    ctx.logger.info(f"Received response containing: {msg.outfit}")
    ctx.storage.set("outfit", msg.outfit)

@agent.on_rest_post("/rest/post1", UpdateRequest, StatusResponse)
async def handle_post(ctx: Context, req: UpdateRequest) -> StatusResponse:
    ctx.logger.info("Recieved update request")
    if req.category_name not in WARDROBE:
        WARDROBE[req.category_name] = []
    WARDROBE[req.category_name].append(image_to_text(req.image_path))
    ctx.logger.info("Updated wardrobe with new image")
    return StatusResponse(status=True)

@agent.on_rest_post("/rest/post2", ClearRequest, StatusResponse)
async def handle_post(ctx: Context, req: ClearRequest) -> StatusResponse:
    ctx.logger.info("Recieved clear request")
    if req.clear:
        global WARDROBE
        WARDROBE.clear()
        return StatusResponse(status=True)
    return StatusResponse(status=False)

@agent.on_rest_post("/rest/post3", PrintWardrobeRequest, StatusResponse)
async def handle_post(ctx: Context, req: PrintWardrobeRequest) -> StatusResponse:
    ctx.logger.info(WARDROBE)
    return StatusResponse(status=True)

@agent.on_rest_post("/rest/post4", SendRequest, Response)
async def handle_post(ctx: Context, req: SendRequest) -> Response:
    ctx.logger.info("Recieved prompt: " + req.prompt)
    request = Request(prompt=req.prompt, wardrobe=WARDROBE)
    ctx.logger.info(request)

    await ctx.send(AI_AGENT_ADDRESS, request)
    wait = True
    response_ = None
    while (wait):
        try:
            time.sleep(2)
            response_ = Response(outfit=ctx.storage.get("outfit"))
            wait = False
        except Exception as e:
            ctx.logger.info("waiting...")
    ctx.logger.info("sent response")
    return response_

if __name__ == "__main__":
    agent.run()


"""
curl -X POST http://0.0.0.0:8000/rest/post1 \
     -H "Content-Type: application/json" \
     -d '{"category_name": "pants", "image_path": "pants.jpg"}'


curl -X POST http://0.0.0.0:8000/rest/post3 \
     -H "Content-Type: application/json" \
     -d '{"print": true}'

curl -X POST http://0.0.0.0:8000/rest/post2 \
     -H "Content-Type: application/json" \
     -d '{"clear": true}'

curl -X POST http://0.0.0.0:8000/rest/post4 \
     -H "Content-Type: application/json" \
     -d '{"prompt": "a pair of pants"}'
"""
