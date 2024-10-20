from typing import Dict, List
from uagents import Agent, Context, Model

class Request(Model):
    prompt: str
    wardrobe: Dict[str, List[str]]


class Response(Model):
    outfit: List[List[str]]

class PickRequest(Model):
    prompt: str
    category_name: str
    category: List[str]

class PickResponse(Model):
    category_name: str
    article_id: int
    article: str



agent = Agent(
    name="OutfitAgent",
    port=8001,
    endpoint="http://localhost:8001/submit",
    mailbox="838d26be-1450-4926-9216-7590fde480f0",
    seed="outfit_agent_thing_21332"
)

@agent.on_event("startup")
def send_message(ctx: Context):
    ctx.logger.info("Starting agent...")
    ctx.logger.info(ctx.address)


@agent.on_message(PickResponse)
async def handle_pick_response(ctx: Context, sender: str, msg: PickResponse):
    ctx.logger.info(f"Recieved response from selection for {msg.category_name}")
    ctx.storage.set(msg.category_name, [str(msg.article_id), msg.article])
    if (ctx.storage.get("counter") == ctx.storage.get("count")):
        response_ = Response(outfit=[ctx.storage.get(key) or [] for key in ctx.storage.get("w_keys")])
        ctx.logger.info(response_)
        await ctx.send(ctx.storage.get("sender"), response_)
        ctx.logger.info("Sent final outfit")


AI_AGENT_ADDRESS = "agent1qw4cazhaca36xzhw2txjxwg4srt7e8ql76j6980q2plz47ffrfn8q24fry0"

@agent.on_message(Request)
async def handle_request(ctx: Context, sender: str, msg: Request):
    ctx.logger.info("Received request: " + msg.prompt)
    ctx.logger.info("Received POST request")
    wardrobe = msg.wardrobe
    ctx.storage.set("w_keys", list(wardrobe.keys()))
    ctx.storage.set("sender", sender)
    ctx.storage.set("count", len(wardrobe))
    ctx.storage.set("counter", 0)

    for category, clothes in wardrobe.items():
        if len(clothes) > 0:
            await ctx.send(AI_AGENT_ADDRESS, PickRequest(prompt=msg.prompt, category_name=category, category=clothes))
            ctx.storage.set("counter", ctx.storage.get("counter") + 1)
            ctx.logger.info(f"Sent {category} request to AI agent")
        else:
            ctx.storage.set("counter", ctx.storage.get("counter") + 1)
            ctx.storage.set(category, "")
            ctx.logger.info(f"No {category} to choose from")
  
    


    
   

    

if __name__ == "__main__":
    agent.run()

"""
curl -d '{"prompt": "formal get together", "wardrobe": {"pants": ["black dress pants", "dark blue denim pants", "black ripped jeans", "white linen pants", "black leather pants"]}}' -H "Content-Type: application/json" -X POST http://0.0.0.0:8000/endpoint
curl -d '{"prompt": "formal get together", "wardrobe": {"pants": ["black dress pants", "dark blue denim pants", "black ripped jeans", "white linen pants", "black leather pants"]}}' -H "Content-Type: application/json" -X POST http://0.0.0.0:8000/rest/post

"""