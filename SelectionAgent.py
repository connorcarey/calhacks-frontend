from typing import List
import chromadb
from uagents import Agent, Context, Model

class PickRequest(Model):
    prompt: str
    category_name: str
    category: List[str]

class PickResponse(Model):
    category_name: str
    article_id: int
    article: str
#agent1qw4cazhaca36xzhw2txjxwg4srt7e8ql76j6980q2plz47ffrfn8q24fry0
agent = Agent(
    name="SelectionAgent",
    endpoint="http://localhost:8002/submit",
    port=8002,
    mailbox="6a7beab8-6927-4b70-b537-2b0222c4c8ec",
    seed="selection_agent_seed_1234576",
)

@agent.on_event("startup")
async def send_message(ctx: Context):
    ctx.logger.info("Starting agent...")
    ctx.logger.info(ctx.address)


@agent.on_message(PickRequest)
async def handle_response(ctx: Context, sender: str, msg: PickRequest):
    client = chromadb.Client()
    collection = client.get_or_create_collection('fruit')
    for i in range(len(msg.category)):
        collection.add(
            ids=[str(i)],
            documents=[msg.category[i]]
        )
    
    article = collection.query(query_texts=msg.prompt, n_results=1)    
    await ctx.send(sender, PickResponse(category_name=msg.category_name, article_id=int(article["ids"][0][0]), article=article["documents"][0][0]))
    ctx.logger.info("Sent response containing: " + article["documents"][0][0])

if __name__ == "__main__":
    agent.run()