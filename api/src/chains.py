# src/chains.py
from typing import Dict, Any, Literal
from langchain_core.runnables import RunnableBranch
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

# --- THIS IS THE FIX ---
# REMOVE the old, incorrect imports:
# from src.config import llm  <-- DELETE THIS LINE
# from src.data_loader import r_packages_retriever, course_modules_retriever <-- DELETE THIS LINE

def create_master_chain(llm, retrievers):
    """
    Creates and returns the master hybrid chain and the suggestion chain.
    It now RECEIVES llm and retrievers as arguments.
    """
    # A. The Router Chain
    router_prompt = PromptTemplate.from_template(
        """Given the user question, classify it into one of the following categories: `r_packages`, `course_modules`, or `general_knowledge`.
        Do not respond with more than one word.

        `r_packages`: Use for questions specifically about R packages like dplyr, ggplot2, tidyr, their functions, and usage based on package documentation.

        `course_modules`: Use ONLY for questions about topics explicitly covered in the ThinkNeuro course material, such as bibliometrics, research methodology, data sharing, or specific R concepts taught in the lectures (e.g., assigning variables with `<-`).

        `general_knowledge`: Use for all other questions, including general programming concepts, statistical questions (like p-values), or topics not mentioned in the course content.

        <question>{input}</question>
        Classification:"""
    )
    router = router_prompt | llm

    # B. RAG Chain for Course Modules
    course_rag_prompt = ChatPromptTemplate.from_template(
        "Use the course material context to answer.\nContext: {context}\nQuestion: {input}\nAnswer:"
    )
    course_qa_chain = create_stuff_documents_chain(llm, course_rag_prompt)
    course_modules_rag_chain = create_retrieval_chain(retrievers["course_modules"], course_qa_chain)

    # C. RAG Chain for R Packages
    package_rag_prompt = ChatPromptTemplate.from_template(
        "Use the R package manual context to answer.\nContext: {context}\nQuestion: {input}\nAnswer:"
    )
    package_qa_chain = create_stuff_documents_chain(llm, package_rag_prompt)
    r_packages_rag_chain = create_retrieval_chain(retrievers["r_packages"], package_qa_chain)

    # D. General Knowledge Chain
    general_chain = PromptTemplate.from_template("Answer the question.\nQuestion: {input}") | llm

    # E. Suggestion Chain
    suggestion_chain = PromptTemplate.from_template(
        "Based on the question and answer, suggest 3 follow-up questions.\nQUESTION: {input}\nANSWER: {answer}\nSUGGESTED NEXT QUESTIONS:"
    ) | llm
    
    # F. The Master Hybrid Chain
    def route(info: Dict[str, Any]) -> Literal["course_modules", "r_packages", "general_knowledge"]:
        topic_str = info["topic"].content.lower()
        print(f"DEBUG ROUTER: Router classified as: '{topic_str}'")
        if "course_modules" in topic_str: 
            print(f"DEBUG ROUTER: Routing to course_modules")
            return "course_modules"
        if "r_packages" in topic_str: 
            print(f"DEBUG ROUTER: Routing to r_packages")
            return "r_packages"
        print(f"DEBUG ROUTER: Routing to general_knowledge")
        return "general_knowledge"

    master_chain = {"topic": router, "input": lambda x: x["input"]} | RunnableBranch(
        (lambda x: route(x) == "course_modules", course_modules_rag_chain),
        (lambda x: route(x) == "r_packages", r_packages_rag_chain),
        general_chain
    )
    
    return master_chain, suggestion_chain