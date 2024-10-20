from uagents import Agent, Context, Model
import time
class NumberRequest(Model):
    lower_bound: int
    upper_bound: int

class Number(Model):
    number: int


agent = Agent(
    name="user",
    endpoint="http://localhost:8000/submit",
    mailbox="06fd009d-615b-4271-be5a-2763b7f329d6",
)

AI_AGENT_ADDRESS = "agent1q0yduh7fwf7ddjychnscvn846wxdtwage3vxkaxzjpmm968atzd0zcywqqa"

print(agent.address)

@agent.on_event("startup")
async def send_message(ctx: Context):
    await ctx.send(AI_AGENT_ADDRESS, NumberRequest(lower_bound=100, upper_bound=150))
    ctx.logger.info(f"Sent request to AI agent")


@agent.on_message(Number)
async def handle_response(ctx: Context, sender: str, msg: Number):
    ctx.logger.info(f"Received response from {sender}:")
    ctx.logger.info(msg)
    ctx.storage.set("number", msg.number)

@agent.on_rest_post("/rest/post", NumberRequest, Number)
async def handle_post(ctx: Context, req: NumberRequest) -> Number:
    ctx.logger.info("Received POST request")
    await ctx.send(AI_AGENT_ADDRESS, NumberRequest(lower_bound=req.lower_bound, upper_bound=req.upper_bound))
    ctx.logger.info(f"Sent request to AI agent")
    return Number(number=ctx.storage.get("number"))

if __name__ == "__main__":
    agent.run()

"""
curl -X POST http://0.0.0.0:8000/rest/post \
     -H "Content-Type: application/json" \
     -d '{"lower_bound": 100, "upper_bound": 150}'
"""