from flask import Flask, request, jsonify
import torch
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms import LlamaCpp
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from serverless_wsgi import handle_request  # For lambda compatibility

app = Flask(__name__)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load PDF document
loader = PyPDFLoader(file_path="static/Doshi_Paarth_21CE2022.pdf")
data = loader.load()

# Split text into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=200)
text_chunks = text_splitter.split_documents(data)

# Initialize LLM for generating responses
llm_answer_gen = LlamaCpp(
    streaming=True,
    model_path="static/mistral-7b-openorca.Q4_0.gguf",
    temperature=0.75,
    top_p=1,
    f16_kv=True,
    verbose=False,
    n_ctx=4096
)

# Create vector database for embeddings
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2", model_kwargs={"device": device})
vector_store = Chroma.from_documents(text_chunks, embeddings)

# Setup conversation retrieval chain
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
answer_gen_chain = ConversationalRetrievalChain.from_llm(
    llm=llm_answer_gen, retriever=vector_store.as_retriever(), memory=memory
)

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message")
    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    response = answer_gen_chain.run({"question": user_input})
    return jsonify({"reply": response})

# Lambda-compatible handler
def handler(event, context):
    return handle_request(app, event, context)
