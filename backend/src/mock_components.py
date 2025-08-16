import re
from typing import List
from langchain_core.embeddings import Embeddings
from langchain.chat_models.base import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage
from langchain_core.outputs import ChatResult, ChatGeneration

class FakeEmbeddings(Embeddings):
    _dimension = 10 
    def embed_documents(self, texts: List[str]) -> List[List[float]]: return [[0.1] * self._dimension for _ in texts]
    def embed_query(self, text: str) -> List[float]: return [0.1] * self._dimension

class FakeChatModel(BaseChatModel):
    def _generate(self, messages: List[BaseMessage], **kwargs) -> ChatResult:
        full_prompt = messages[-1].content
        lower_prompt = full_prompt.lower()
        text = "This is a fallback mock response. The question wasn't recognized."

        # --- 1. Handle ROUTING prompt ---
        # This part decides which 'expert' should answer the question.
        if "classify it as" in lower_prompt:
            match = re.search(r"<question>(.*?)<\/question>", lower_prompt)
            question_text = match.group(1) if match else ""

            if any(keyword in question_text for keyword in ["bibliometrics", "rstudio", "assign", "variable", "console"]):
                text = "course_modules"
            elif any(keyword in question_text for keyword in ["ggplot2", "dplyr"]):
                text = "r_packages"
            else: # Default for "p-value", "review my code", etc.
                text = "general_knowledge"

        # --- 2. Handle COURSE MODULES answer prompt ---
        # This part gives a realistic answer if the router chose 'course_modules'.
        elif "course material context" in lower_prompt:
            match = re.search(r"Question: (.*?)\nAnswer:", full_prompt)
            question_text = match.group(1).lower() if match else ""

            if "bibliometrics" in question_text:
                text = "From the course material, bibliometrics is defined as the quantitative analysis of scientific publications. It's essentially using numbers and statistical methods to study the impact and trends of published research."
            elif "rstudio" in question_text or "console" in question_text:
                text = "The course explains that R is the core programming language, like a car's engine. RStudio, on the other hand, is the dashboard or integrated development environment (IDE) that makes writing and managing your R code much easier. The RStudio interface includes the console, where code is executed, and the script editor."
            elif "assign a variable" in question_text:
                text = "In R, the standard convention taught in the course for assigning a value to a variable is to use the arrow operator, which looks like this: `x <- 10`. This assigns the value 10 to the variable x."
            else:
                text = "This is a mock response from the course materials. It seems you've asked about a topic covered in the lectures."

        # --- 3. Handle R PACKAGES answer prompt ---
        # This part gives a realistic answer if the router chose 'r_packages'.
        elif "r package manual context" in lower_prompt:
            match = re.search(r"Question: (.*?)\nAnswer:", full_prompt)
            question_text = match.group(1).lower() if match else ""

            if "ggplot2" in question_text:
                text = "According to the R package manuals, `ggplot2` is a powerful and flexible package for creating a wide variety of static and interactive data visualizations. It is based on the 'Grammar of Graphics' concept, allowing you to build plots layer by layer."
            elif "dplyr" in question_text:
                text = "The `dplyr` package is a core part of the Tidyverse and provides a consistent set of verbs to solve the most common data manipulation challenges, such as `mutate()` to add new variables, `filter()` to select rows, and `summarise()` to aggregate data."
            else:
                text = "This is a mock answer from the R package manuals."
            
        # --- 4. Handle SUGGESTION prompt (NEW DYNAMIC LOGIC) ---
        # This provides realistic, context-specific follow-up questions.
        elif "suggested next questions" in lower_prompt:
            match = re.search(r"QUESTION: (.*?)\nANSWER:", full_prompt, re.DOTALL)
            question_text = match.group(1).lower() if match else ""

            if "bibliometrics" in question_text:
                text = "1. How are scientific trends tracked?\n2. What's an example of influential research?\n3. Can bibliometrics show collaboration patterns?"
            elif "rstudio" in question_text:
                text = "1. What are the four main panes in RStudio?\n2. How do I create a new script?\n3. Where do variables appear?"
            elif "assign a variable" in question_text:
                text = "1. What other data types can I assign?\n2. How do I create a vector?\n3. How do I view the value of a variable?"
            elif "ggplot2" in question_text:
                text = "1. How do I make a bar chart?\n2. How can I change the colors of my plot?\n3. What is a 'geom'?"
            elif "dplyr" in question_text:
                text = "1. How do I select specific columns?\n2. How do I sort my data?\n3. What does the pipe operator `%>%` do?"
            elif "p-value" in question_text:
                text = "1. What is a null hypothesis?\n2. What is a common significance level?\n3. How does this relate to confidence intervals?"
            else:
                # Default suggestions for general questions or code review
                text = "1. What is a data frame in R?\n2. How do I install R packages?\n3. Can you show me a basic plot?"

        # --- 5. Handle GENERAL KNOWLEDGE answer prompt ---
        # This handles all other questions with realistic answers.
        else:
            match = re.search(r"Question: (.*?)$", full_prompt)
            question_text = match.group(1).lower() if match else lower_prompt

            if "review my r code" in question_text:
                text = "Of course, I can help with that! Please paste your R code, and I'll take a look. For example, if you provide code like this:\n```r\n# My code to review\nfor (i in 1:length(my_list)) {\n  print(my_list[i])\n}\n```\nI can check for common errors, suggest more efficient ways to write it, and ensure it follows best practices."
            elif "p-value" in question_text:
                text = "In statistics, a p-value helps you determine the significance of your results in relation to a null hypothesis. A small p-value (typically ≤ 0.05) indicates strong evidence against the null hypothesis, so you reject it. A large p-value (> 0.05) indicates weak evidence against the null hypothesis, so you fail to reject it."
            else:
                text = "This is a general knowledge mock response. I can answer questions about a wide variety of topics outside of the specific course material."

        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=text))])

    def _llm_type(self) -> str: return "fake-chat-model"

def get_mock_llm():
    """Returns a configured mock LLM."""
    print("--- Creating Mock LLM ---")
    return FakeChatModel()

def get_mock_embeddings():
    """Returns a configured mock Embeddings model."""
    print("--- Creating Mock Embeddings ---")
    return FakeEmbeddings()