# Chat with langroid/langroid

## You

if you were to start again how would you tell the developer to build your project step by step?

## AI

Based on the information provided, I cannot answer your question about how to build a project step by step from scratch. The context primarily contains examples of how agents are instructed within the Langroid framework, focusing on interaction patterns and tool usage, rather than a general project development methodology.

### Assistant's Reasoning

The user is asking for a step-by-step guide on building a project from scratch. The provided context contains examples of agent instructions and tool usage within the Langroid framework, focusing on interaction patterns (like asking one question at a time, using specific addresses like @User or @DocAgent, or using tools like DoneTool). None of the context provides a general methodology for building a software project from the ground up. Therefore, the provided context is not relevant to the user's question. I must inform the user that I cannot answer based on the given information.

### Source Code References

#### 1. examples/docqa/chat-qa-summarize.py

```py
check whether the user's message consists of
            NO QUESTION, ONE question or MULTIPLE questions. This is how you must respond:
        
            - If the msg is NOT SEEKING any INFO, respond with this:
                "Please ask a SINGLE QUESTION about a topic you want to know about.
                Wait for the answer before asking your next question".
            - If user's msg contains just ONE question, or no question at all, say DONE
            - Otherwise (i.e there are MULTIPLE questions/requests for info),
              then respond with this:
            "Please ask only ONE question at a time. Ask your question again.
            Only when you have answers to all of your questions present your final
            bullet points saying  'DONE here are the bullet pts...'."
            
            IMPORTANT: DO NOT TRY TO ANSWER THE QUESTIONS YOURSELF.            
            """,
        ),
    )
    validator_task = lr.Task(validator_agent, interactive=False, single_round=True)

    writer_task.add_sub_task([validator_task, doc_task])

    writer_task.run()


if __name__ == "__main__":
    app()

```

#### 2. examples/docqa/doc-aware-compose-2.py

```py
always show them
            a NUMBERED list of choices.       
            
        ASK AT MOST 5 QUESTIONS TO THE USER, then generate the requested
        document to the best of your ability.   
        """,
    )
    composer_task.add_sub_task(doc_task)

    while True:
        query = Prompt.ask("[blue]How can I help?")
        if query in ["x", "q"]:
            break
        composer_task.run(query)


if __name__ == "__main__":
    Fire(main)

```

#### 3. examples/docqa/doc-based-troubleshooting.py

```py
 and NOT on your existing knowledge. NEVER answer based on your own knowledge,
          ALWAYS refer to the documents.
          However you do NOT have direct access to the docs, but you have an assistant
          named DocAgent, who DOES have access to the documents.
          
        Since you could be talking to TWO people, in order to CLARIFY who you are
        addressing, you MUST ALWAYS EXPLICITLY ADDRESS either the 
        "User" or the "DocAgent" using {AT}User or {AT}DocAgent, respectively.
        
        You must THINK like this at each step after receiving a question from the User:
        
        (I NEVER WANT TO Overwhelm DocAgent or User with TOO MANY QUESTIONS,
        so I will ALWAYS ask ONE question at a time)
        
        - I must first find out more about this topic from DocAgent, 
            let me address DocAgent to get more information.
        - I got some info from DocAgent, let me now ask the User a follow-up question
            to get ONE SPECIFIC piece of information about their situation.
        - I need to get MORE info from DocAgent, let me ask DocAgent for more info.
        - DocAgent said {NO_ANSWER}!!, Let me try asking a different way.
        - I have 
```

#### 4. examples/docqa/doc-chat-2.py

```py
questions are stand-alone questions that don't refer to entities mentioned 
            earlier in the dialog.
        (e) if DocAgent is unable to answer after your best efforts, you can say
            {NO_ANSWER} and move on to the next question.
        (f) answers should be based ONLY on the documents, NOT on your prior knowledge.
        (g) be direct and concise, do not waste words being polite.
        (h) if you need more info from the user, before asking DocAgent, you should 
        address questions to the "User" (not to DocAgent) to get further 
        clarifications or information. 
        (i) Always ask questions ONE BY ONE (to either User or DocAgent), NEVER 
            send Multiple questions in one message.
        (j) Use bullet-point format when presenting multiple pieces of info.
        (k) When DocAgent responds without citing a SOURCE and EXTRACT(S), you should
            send your question again to DocChat, reminding it to cite the source and
            extract(s).
        
        Start by asking the user what they want to know.
        """,
    )
    writer_task.add_sub_task(doc_task)

    while True:
        query = Prompt.ask("[blue]How can I help?")
        if query in ["x", "q"]:
            break
 
```

#### 5. examples/chainlit/multi-extract-3.py

```py
I will answer each question. 
        If I am unable to answer your question initially, try asking me 
        differently. If I am still unable to answer after 3 tries, fill in 
        {NO_ANSWER} for that field.
        When you have collected this info, present it to me using the 
        'lease_info' function/tool.
        DO NOT USE THIS Function/tool UNTIL YOU HAVE ASKED QUESTIONS 
        TO FILL IN ALL THE FIELDS.
        
        Think step by step. 
        Phrase each question simply as "What is ... ?",
        and do not explain yourself, or say any extraneous things. 
        Start by asking me for the start date of the lease.
        When you receive the answer, then ask for the next field, and so on.
        """,
    )

    validator_agent = ChatAgent(
        ChatAgentConfig(
            llm=llm_cfg,
            vecdb=None,
            system_message=f"""
            You are obedient, understand instructions, and follow them faithfully,
            paying attention to the FORMAT specified,
            and you are also extremely CONCISE and SUCCINCT in your responses.
            
       
```

#### 6. examples/docqa/doc-based-troubleshooting.py

```py
answer.   
            
        IMPORTANT: When giving the User a list of choices, always show them
            a NUMBERED list of choices.     
            
        I REPEAT -- NEVER use your OWN KNOWLEDGE. ALWAYS RELY ON the Documents
        from DocAgent.     
        """,
    )
    guide_task.add_sub_task(doc_task)

    while True:
        query = Prompt.ask("[blue]How can I help?")
        if query in ["x", "q"]:
            break
        guide_task.run(query)


if __name__ == "__main__":
    Fire(main)

```

#### 7. examples/docqa/doc-chat-multi-llm.py

```py
being polite.
        (h) if you need more info from the user, before asking DocAgent, you should 
        address questions to the "User" (not to DocAgent) to get further 
        clarifications or information. 
        (i) Always ask questions ONE BY ONE (to either User or DocAgent), NEVER 
            send Multiple questions in one message.
        (j) Use bullet-point format when presenting multiple pieces of info.
        (k) When DocAgent responds without citing a SOURCE and EXTRACT(S), you should
            send your question again to DocChat, reminding it to cite the source and
            extract(s).
        
        
        Start by asking the user what they want to know.
        """,
    )
    writer_task.add_sub_task(doc_task)
    writer_task.run("Can you help me with some questions?")

    # show cost summary
    print("LLM usage, cost summary:")
    print(str(langroid.language_models.base.LanguageModel.usage_cost_summary()))


if __name__ == "__main__":
    app()

```

#### 8. examples/docqa/doc-aware-guide-2.py

```py
SPECIFIC piece of information about their situation.
        - I need more info from user, let me ask the User a follow-up question,
            to get ANOTHER SPECIFIC piece of information about their situation.
        ...[and so on]...
        - Now I have ALL the info I need from BOTH the User and DocAgent,
            so I can provide the User a DIRECTLY RELEVANT answer,
            so I will say {DONE}, followed by the answer.   
            
        IMPORTANT: When giving the User a list of choices, always show them
            a NUMBERED list of choices.          
        """,
    )
    guide_task.add_sub_task(doc_task)

    while True:
        query = Prompt.ask("[blue]How can I help?")
        if query in ["x", "q"]:
            break
        guide_task.run(query)


if __name__ == "__main__":
    Fire(main)

```

#### 9. examples/docqa/doc-aware-guide-2.py

```py
guide_agent,
        interactive=False,
        config=task_config,
        system_message=f"""
        You are VERY HELPFUL GUIDE, who wants to help a User with their inquiry.
        
        Your task is to GUIDE them STEP BY STEP toward a specific
        answer that is DIRECTLY RELEVANT to their specific situation.
        
        IMPORTANT: Your guidance/help should ONLY be based on certain DOCUMENTS
          and NOT on your existing knowledge. NEVER answer based on your own knowledge,
          ALWAYS refer to the documents.
          However you do NOT have direct access to the docs, but you have an assistant
          named DocAgent, who DOES have access to the documents.
          
        Since you could be talking to TWO people, in order to CLARIFY who you are
        addressing, you MUST ALWAYS EXPLICITLY ADDRESS either the 
        "User" or the "DocAgent" using {AT}User or {AT}DocAgent, respectively.
        
        You must THINK like this at each step after receiving a question from the User:
        
        (I NEVER WANT TO Overwhelm DocAgent or User with TOO MANY QUESTIONS,
        so I will ALWAYS ask ONE question at a time)
        
        - I must first find 
```

#### 10. examples/docqa/doc-chat-multi-llm.py

```py
     
        Here are the rules:
        (a) when the question is complex or has multiple parts, break it into small 
         parts and/or steps and send them to DocAgent
        (b) if DocAgent says {NO_ANSWER} or gives no answer, try asking in other ways.
        (c) Once you collect all parts of the answer, you can say DONE and give me 
            the final answer. 
        (d) DocAgent has no memory of previous dialog, so you must ensure your 
            questions are stand-alone questions that don't refer to entities mentioned 
            earlier in the dialog.
        (e) if DocAgent is unable to answer after your best efforts, you can say
            {NO_ANSWER} and move on to the next question.
        (f) answers should be based ONLY on the documents, NOT on your prior knowledge.
        (g) be direct and concise, do not waste words being polite.
        (h) if you need more info from the user, before asking DocAgent, you should 
        address questions to the "User" (not to DocAgent) to get further 
        clarifications or information. 
        (i) Always ask questions ONE BY ONE (to either User or DocAgent), NEVER 
            send Multiple questions in one message.
        (j) 
```

#### 11. tests/main/test_multi_agent.py

```py
                
                 
                """,
        user_message="Start by asking me an exponential question.",
    )

    # For a given exponential computation, plans a sequence of multiplications.
    planner = ChatAgent(planner_cfg)
    planner.enable_message(DoneTool)

    task_planner = Task(
        planner,
        interactive=False,
        system_message=f"""
                You understand EXPONENTIALS, and you know an exponential involving
                INTEGERS is simply a sequence of MULTIPLICATIONS.
                However you do NOT know how to MULTIPLY, so you have to BREAK DOWN
                into a series of multiplications, and for each 
                multiplication, send out the desired multiplication question,
                e.g. "16 * 4", and a MULTIPLICATION EXPERT will return the
                answer to you. Then you can ask the next multiplication question,
                and so on, until you have the final answer for the original
                EXPONENTIAL question.

            
```

#### 12. tests/main/test_multi_agent.py

```py
  EXAMPLE:
                Suppose you were told to ask these exponential questions:
                "5**3 10**4  1**5"
                
                1. you ask "5**3"
                2. you receive answer "125"
                3. You say "10**4"  <--- you are asking the NEXT EXPONENTIAL
                4. you receive answer "10000"
                5. You say "1**5"  <--- you are asking the NEXT EXPONENTIAL
                6. you receive answer "1"
                7. you use the `{done_tool_name}` TOOL to send "125 10000 1"
                     as the `content` field in the TOOL
                   
                 
                """,
        user_message="Start by asking me an exponential question.",
    )

    # For a given exponential computation, plans a sequence of multiplications.
    planner = ChatAgent(planner_cfg)
    planner.enable_message(DoneTool)

    task_planner = Task(
   
```

#### 13. examples/quick-start/two-agent-chat.py

```py
what you need, say DONE, and show me the 3 bullet points. 
        """,
    )
    expert_agent = ChatAgent(config)
    expert_task = Task(
        expert_agent,
        name="Expert",
        system_message="""
        You are an expert on Language Models in Machine Learning. 
        You will receive questions on this topic, and you must answer these
        very concisely, in one or two sentences, in a way that is easy for a novice to 
        understand.
        """,
        single_round=True,  # task done after 1 step() with valid response
    )
    student_task.add_sub_task(expert_task)
    student_task.run()


@app.command()
def main(
    debug: bool = typer.Option(False, "--debug", "-d", help="debug mode"),
    no_stream: bool = typer.Option(False, "--nostream", "-ns", help="no streaming"),
    nocache: bool = typer.Option(False, "--nocache", "-nc", help="don't use cache"),
) -> None:
    set_global(
        Settings(
            debug=debug,
            cache=not nocache,
            stream=not no_stream,
        )
    )
    chat()


if __name__ == "__main__":
    app()

```

#### 14. examples/docqa/doc-aware-compose-2.py

```py
DOES have access to the documents.
          
        Since you could be talking to TWO people, in order to CLARIFY who you are
        addressing, you MUST ALWAYS EXPLICITLY ADDRESS either the 
        "User" or the "DocAgent" using {AT}User or {AT}DocAgent, respectively.
        
        You must THINK like this at each step after receiving a 
        DOCUMENT REQUEST from the User:
        
        (I NEVER WANT TO Overwhelm DocAgent or User with TOO MANY QUESTIONS,
        so I will ALWAYS ask ONE question at a time)
        
        - I must first find out more about the type of document the user
         wants, from DocAgent, let me address DocAgent to get the requirements info.
        - I got some info from DocAgent, let me now ask the User a follow-up question
            to get ONE SPECIFIC piece of information about their situation.
        - I need to get MORE info from DocAgent, let me ask DocAgent for more info.
        - DocAgent said {NO_ANSWER}!!, Let me try asking a different way.
        - I have a bit more info, now let me ask the User a further follow-up question,
            to get ONE SPECIFIC piece of information about their situation.
        - I need more info from user, let me ask the 
```

#### 15. examples/docqa/chat_multi_extract.py

```py
      interactive=False,  # set to True to slow it down (hit enter to progress)
        system_message=f"""
        You have to collect some SPECIFIC STRUCTURED information 
        about a Commercial Lease, as specified in the `lease_info` function/tool. 
        But you do not have access to the lease itself. 
        You can ask me questions about the lease, ONE AT A TIME, I will answer each 
        question. You only need to collect info to fill the fields in the 
        `lease_info` function/tool. 
        If I am unable to answer your question initially, try asking me 
        differently. If I am still unable to answer after 3 tries, fill in 
        {NO_ANSWER} for that field.
        When you have collected this info, present it to me using the 
        'lease_info' function/tool.
        DO NOT USE THIS Function/tool UNTIL YOU HAVE ASKED QUESTIONS 
        TO FILL IN ALL THE FIELDS.
        
        Start by asking me for the start date of the lease.
        """,
    )
    lease_task.add_sub_task(doc_task)
    lease_task.run()


if __name__ == "__main__":
    app()

```

#### 16. tests/main/test_multi_agent.py

```py
= Task(
        master,
        interactive=False,
        system_message=f"""
                Your job is to ask  EXACTLY this series of exponential questions:
                {EXPONENTIALS}
                Simply present the needed computation, one at a time, 
                using only numbers and the exponential operator "**".
                Say nothing else, only the numerical operation.
                When you receive the answer, ask 
                the NEXT exponential question, e.g.: "8**2".
                When done asking the series of questions, 
                {done_response}
                
                EXAMPLE:
                Suppose you were told to ask these exponential questions:
                "5**3 10**4  1**5"
                
                1. you ask "5**3"
                2. you receive answer 
```

#### 17. examples/basic/chat-search.py

```py
  
        <your answer here>
        SOURCE: https://www.wikihow.com/Be-a-Good-Assistant-Manager
        EXTRACT: Be a Good Assistant ... requires good leadership skills.
        
        SOURCE: ...
        EXTRACT: ...
        
        For the EXTRACT, ONLY show up to first 3 words, and last 3 words.
        DO NOT MAKE UP YOUR OWN SOURCES; ONLY USE SOURCES YOU FIND FROM A WEB SEARCH.
        """,
    )
    agent = lr.ChatAgent(config)

    agent.enable_message(search_tool_class)

    task = lr.Task(agent, interactive=False)

    # local models do not like the first message to be empty
    user_message = "Can you help me with some questions?"
    task.run(user_message)


if __name__ == "__main__":
    app()

```

#### 18. examples/docqa/chat-multi-extract-3.py

```py
       differently. If I am still unable to answer after 3 tries, fill in 
        {NO_ANSWER} for that field.
        When you have collected this info, present it to me using the 
        'lease_info' function/tool.
        DO NOT USE THIS Function/tool UNTIL YOU HAVE ASKED QUESTIONS 
        TO FILL IN ALL THE FIELDS.
        
        Think step by step. 
        Phrase each question simply as "What is ... ?",
        and do not explain yourself, or say any extraneous things. 
        Start by asking me for the start date of the lease.
        When you receive the answer, then ask for the next field, and so on.
        """,
    )

    validator_agent = ChatAgent(
        ChatAgentConfig(
            llm=llm_cfg,
            vecdb=None,
            system_message=f"""
            You are obedient, understand instructions, and follow them faithfully,
            paying attention to the FORMAT specified,
            and you are also extremely CONCISE and SUCCINCT in your responses.
            
            Your task is to detect if the user's message is asking for ONE
         
```

#### 19. examples/docqa/doc-aware-guide-2.py

```py
"DocAgent" using {AT}User or {AT}DocAgent, respectively.
        
        You must THINK like this at each step after receiving a question from the User:
        
        (I NEVER WANT TO Overwhelm DocAgent or User with TOO MANY QUESTIONS,
        so I will ALWAYS ask ONE question at a time)
        
        - I must first find out more about this topic from DocAgent, 
            let me address DocAgent to get more information.
        - I got some info from DocAgent, let me now ask the User a follow-up question
            to get ONE SPECIFIC piece of information about their situation.
        - I need to get MORE info from DocAgent, let me ask DocAgent for more info.
        - DocAgent said {NO_ANSWER}!!, Let me try asking a different way.
        - I have a bit more info, now let me ask the User a further follow-up question,
            to get ONE SPECIFIC piece of information about their situation.
        - I need more info from user, let me ask the User a follow-up question,
            to get ANOTHER SPECIFIC piece of information about their situation.
        ...[and so on]...
        - Now I have ALL the info I need from BOTH the User and DocAgent,
            so I can provide the User a 
```

#### 20. examples/basic/multi-agent-medical.py

```py
                PHASE 1: Ask your assistant NATURAL LANGUAGE questions (NO TOOLS), which may span
                        MULTIPLE ROUNDS. ASK EXACTLY ONE QUESTION in each round. DO NOT ASK MULTIPLE QUESTIONS AT ONCE.
                        Avoid fabricating interactions or simulating dialogue with Dr. Y.
                        Instead, clearly articulate your questions or follow-ups, analyze Dr. Y's responses,
                        and use this information to guide your decision-making.
                    PHASE 2: Once you have gathered sufficient information, return your final decision
                        using the TOOL `{ExpectedTextTool.name()}`:
                        - `final_decision` should be your BINARY yes/no answer
                        - `long_answer` should provide a detailed explanation for your final decision.
                    DO NOT mention the TOOL to Dr. Y. It is your responsibility to write and submit the expectedText.
                    """

ASSISTANT_SYS_MSG = """You are Dr. Y, 
```

## You

please give me deep understanding of the projects architecture, tech stack and the most important parts of your code

## AI

## Langroid Architecture and Core Concepts

Langroid is a Python framework designed to build LLM-powered applications using a **multi-agent programming paradigm**. The core idea is to set up **Agents** with specific capabilities and assign them **Tasks**, allowing them to collaboratively solve problems by exchanging messages.

The architecture is based on the following key components:

1.  **Agents**: These are the fundamental building blocks. An `Agent` encapsulates the LLM conversation state and can optionally be equipped with a vector store and tools. Agents act as *message transformers* and have methods to respond to different entities (LLM, Agent, User).
2.  **Tasks**: A `Task` wraps an `Agent` and provides it with instructions (roles, goals). It manages the conversation flow, handles the agent's responses, and orchestrates interactions, including **hierarchical, recursive task-delegation**. The `Task.run()` method is central to executing the agent's workflow.
3.  **Tools/Plugins/Function-calling**: Langroid supports integrating external functionalities that agents can use. This includes OpenAI's function calling and Langroid's native **tools**. Tools are defined using Pydantic models, simplifying their definition and enabling robust handling of structured outputs and error feedback to the LLM.
4.  **Language Models (LLMs)**: Langroid provides an abstract interface for different LLM providers. It supports OpenAI models (GPT-3.5-Turbo, GPT-4) natively and can integrate with hundreds of other models (local, open, commercial) via proxy libraries like LiteLLM.
5.  **Vector Stores**: These are used for Retrieval-Augmented Generation (RAG), allowing agents to access and retrieve information from external documents or data. Langroid supports various vector databases, including Qdrant, Chroma, LanceDB (default), Pinecone, PostgresDB (PGVector), and Weaviate.

The design emphasizes **modularity, reusability, and loose coupling** between Agents and Tasks, allowing for flexible system design.

## Tech Stack

Langroid is built in Python and integrates with a variety of technologies:

*   **Core Framework**: Python
*   **LLM Providers**: OpenAI, various others via LiteLLM, local models (ollama, oobabooga)
*   **Vector Databases**: LanceDB, Qdrant, Chroma, Pinecone, PGVector, Weaviate
*   **Caching**: Redis
*   **Tooling**: Pydantic (for tool definitions), various search APIs (Google, DuckDuckGo, Tavily, Exa), DepsDev API (for dependency analysis example), MCP Servers.
*   **Databases (Examples)**: Neo4j (for knowledge graphs)
*   **APIs**: OpenAI Assistant API

## Most Important Parts of the Code

The core functionality of Langroid resides in the implementations of the key architectural components:

*   **Agent Implementation**: The base `Agent` class and its derivatives are crucial. Look into files within `langroid/agent/`, particularly `langroid/agent/chat_agent.py` for the base chat agent and `langroid/agent/base.py`.
*   **Task Orchestration**: The `Task` class implementation manages the agent workflow and multi-agent interactions. The code for this is primarily in `langroid/agent/task.py`.
*   **Tool System**: The mechanism for defining and using tools is fundamental for extending agent capabilities. Explore the `langroid/agent/tools/` directory, including `langroid/agent/tools/tool_message.py`.
*   **LLM and Vector Store Interfaces**: The abstract interfaces and concrete implementations for interacting with LLMs and vector databases are key integration points. These are found in `langroid/language_models/` and `langroid/vector_store/` respectively.

Examples like the Dependency Chatbot (`examples/kg-chat/dependency_chatbot.py`) and the Lease Extractor (`examples/langroid_quick_examples.ipynb`, `README.md`) showcase how these core components are combined to build functional multi-agent applications using RAG and tools, providing practical insight into the framework's usage.

### Assistant's Reasoning

The user is asking for a deep dive into the architecture, tech stack, and important code parts of the Langroid project. I need to synthesize information from the provided context (README, CLAUDE.md, example notebooks/scripts) to describe the core concepts (Agents, Tasks, Tools), the technologies used (LLMs, Vector Stores, Databases, etc.), and point to the relevant code areas.

### Source Code References

#### 1. README.md

```md
[![Share on Twitter](https://img.shields.io/twitter/url?style=social&url=https://github.com/langroid/langroid)](https://twitter.com/intent/tweet?text=Langroid%20is%20a%20powerful,%20elegant%20new%20framework%20to%20easily%20build%20%23LLM%20applications.%20You%20set%20up%20LLM-powered%20Agents%20with%20vector-stores,%20assign%20tasks,%20and%20have%20them%20collaboratively%20solve%20problems%20via%20message-transformations.%20https://github.com/langroid/langroid)
[![Share on LinkedIn](https://img.shields.io/badge/Share%20on-LinkedIn-blue)](https://www.linkedin.com/shareArticle?mini=true&url=https://github.com/langroid/langroid&title=Langroid:%20A%20Powerful,%20Elegant%20Framework&summary=Langroid%20is%20a%20powerful,%20elegant%20new%20framework%20to%20easily%20build%20%23LLM%20applications.%20You%20set%20up%20LLM-powered%20Agents%20with%20vector-stores,%20assign%20tasks,%20and%20have%20them%20collaboratively%20solve%20problems%20via%20message-transformations.)
[![Share on Hacker News](https://img.shields.io/badge/-Share%20on%20Hacker%20News-orange)](https://news.ycombinator.com/submitlink?u=https%3A%2F%2Fgithub.com%2Flangroid%2Flangroid&t=Harness%20LLMs%20with%20Multi-Agent%20Programming)
[![Share on Reddit](https://img.shields.io/badge/-Share%20on%20Reddit-blue)](https://www.reddit.com/submit?url=https%3A%2F%2Fgithub.com%2Flangroid%2Flangroid&title=Harness%20LLMs%20with%20Multi-Agent%20Programming)

Your support will help build Langroid's momentum and community.

# Langroid Co-Founders

- [Prasad Chalasani](https://www.linkedin.com/in/pchalasani/) (IIT BTech/CS, CMU PhD/ML; Independent ML Consultant)
- [Somesh Jha](https://www.linkedin.com/in/somesh-jha-80208015/) (IIT BTech/CS, CMU PhD/CS; Professor of CS, U Wisc at Madison)






```

#### 2. examples/chainlit/dependency_chatbot.py

```py
       ),
    )

    system_message = f"""You are an expert in Dependency graphs and analyzing them using
    Neo4j. 
    
    FIRST, I'll give you the name of the package that I want to analyze.
    
    THEN, you can also use the `web_search` tool/function to find out information about a package,
      such as version number and package type (PyPi or not). 
    
    If unable to get this info, you can ask me and I can tell you.
    
    DON'T forget to include the package name in your questions. 
      
    After receiving this information, make sure the package version is a number and the
    package type is PyPi.
    THEN ask the user if they want to construct the dependency graph,
    and if so, use the tool/function `construct_dependency_graph` to construct
      the dependency graph. Otherwise, say `Couldn't retrieve package type or version`
      and {NO_ANSWER}.
    After constructing the dependency graph successfully, you will have access to Neo4j 
    graph database, which contains dependency graph.
    You will try your best to answer my questions. Note that:
    1. You can use the tool `get_schema` to get node label and relationships in the
    dependency graph. 
    2. You can use the tool `retrieval_query` to get relevant information from the
      graph database. I will execute this query and send you back the result.
      Make sure your queries comply with the database schema.
    3. Use the `web_search` tool/function to get information if needed.
    To display the dependency graph use this tool `visualize_dependency_graph`.
   
```

#### 3. examples/kg-chat/DependencyChatbot.ipynb

```ipynb
PyPi.\n",
    "3.   The user confirms the package details.\n",
    "4.   The chatbot will construct the dependency graph of the package including transitive dependencies.\n",
    "5.   At this stage, the user can ask the chatbot any question about the dependency graph, such as:\n",
    "  *   What are the packages at level 2?\n",
    "  *   Tell me 3 interesting things about the dependency graph?\n",
    "6.   For some questions that the chatbot can't answer from the the graph, it can use a web search tool to obtain additional information. For example, to identify the package version, the chatbot will use the web search tool.\n",
    "\n",
    "\n",
    "\n",
    "## Implementation\n",
    "We developed this application using the following tools/APIs:\n",
    "\n",
    "*   [Langroid](https://github.com/langroid/langroid): a framework for developling LLM applications.\n",
    "*   [Neo4j](https://neo4j.com/): a graph database management system.\n",
    "*   [Cypher Query Language](): graph query language that lets you retrieve data from the graph. It is like SQL for graphs.\n",
    "*   [DepsDev](https://deps.dev/): Open Source Insights is a service developed and hosted by Google to help developers better understand the structure, construction, and security of open source software packages.\n",
    "\n",
    "\n",
    "## Required environment settings:\n",
    "\n",
    "Before proceeding with the implementation, ensure that you have the necessary environment settings and keys in place.\n",
    "\n",
    "*   `OPENAI_API_KEY`\n",
    "*   GoogleSearchTool requires two keys:\n",
    "    *   `GOOGLE_API_KEY`: [setup a Google API key](https://developers.google.com/custom-search/v1/introduction#identify_your_application_to_google_with_api_key),\n",
    "    *   `GOOGLE_CSE_ID`: [setup a Google Custom Search Engine (CSE) and get the CSE ID](https://developers.google.com/custom-search/docs/tutorial/creatingcse)\n",
    "* 
```

#### 4. examples/kg-chat/DependencyChatbot.ipynb

```ipynb
{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {
    "colab_type": "text",
    "id": "view-in-github"
   },
   "source": [
    "<a href=\"https://colab.research.google.com/github/langroid/langroid/blob/main/examples/kg-chat/DependencyChatbot.ipynb\" target=\"_parent\"><img src=\"https://colab.research.google.com/assets/colab-badge.svg\" alt=\"Open In Colab\"/></a>"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "M0zyjyKDE_0p"
   },
   "source": [
    "\n",
    "<img width=\"700\" src=\"https://raw.githubusercontent.com/langroid/langroid/main/docs/assets/langroid_neo4j_logos.png\" alt=\"Langroid\">\n"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "4o6uFZwWko7C"
   },
   "source": [
    "# Overview\n",
    "\n",
    "🔥 for those curious about leveraging the power of LLM and knowledge graph in the software supply security domain.\n",
    "In this colab, we unveil the **Dependency Chatbot**, an LLM-powered application, equipped with a suite of specialized tools. It harnesses the power of Neo4j knowledge-graph and LLM for:\n",
    "\n",
    "* crafting queries in Neo4j's native language,\n",
    "* constructing detailed dependency graphs via DepsDev API,\n",
    "* searching the web for broader web-based insights.\n",
    "\n",
    "\n"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "zpFtWFn8K-Ui"
   },
   "source": [
    "# Motivation: Software Supply Chain Security\n",
    "\n",
    "This is a rapidly growing field, especially in light of the significant increase in software supply chain attacks. It focuses primarily on understanding and managing the dependencies in your software supply chain. With the rise of open-source and third-party components in software development, the need for supply chain security has become more critical than ever. Organizations are now realizing the importance of vetting and monitoring the components and dependencies they rely on to ensure the integrity and security of their software. As this field continues to evolve, it will be essential for developers and organizations to 
```

#### 5. docs/index.md

```md
detailed logs of multi-agent interactions and
  maintains provenance/lineage of messages, so that you can trace back
  the origin of a message.
- **Tools/Plugins/Function-calling**: Langroid supports OpenAI's recently
  released [function calling](https://platform.openai.com/docs/guides/gpt/function-calling)
  feature. In addition, Langroid has its own native equivalent, which we
  call **tools** (also known as "plugins" in other contexts). Function
  calling and tools have the same developer-facing interface, implemented
  using [Pydantic](https://docs.pydantic.dev/latest/),
  which makes it very easy to define tools/functions and enable agents
  to use them. Benefits of using Pydantic are that you never have to write
  complex JSON specs for function calling, and when the LLM
  hallucinates malformed JSON, the Pydantic error message is sent back to
  the LLM so it can fix it!



Don't worry if some of these terms are not clear to you. 
The [Getting Started Guide](quick-start/index.md) and subsequent pages 
will help you get up to speed.

```

#### 6. examples/docqa/langroid-lancedb-rag-movies.ipynb

```ipynb
this --\n",
    "provided the underlying data store supports:\n",
    "- a filtering language \"known\" to LLMs (like SQL), and\n",
    "- a computation language \"known\" to LLMs (like a Pandas dataframe expression).\n",
    "\n",
    "This is where [LanceDB](https://github.com/lancedb/lancedb) (the default vector-db in Langroid) comes in:\n",
    "it's a versatile, highly performant, serverless vector-database that\n",
    "supports all of these functions within the same storage system and API:\n",
    "- Fast Full-text search (so you can do lexical search in the same store\n",
    "  where you do vector/semantic-search)\n",
    "- SQL-like metadata filtering\n",
    "- Pandas dataframe interop, so you can ingest dataframes and do pandas computations.\n",
    "**bold text**\n",
    "Leveraging Langroid's powerful Multi-Agent and tools orchestration, we built a\n",
    "3-Agent system consisting of:\n",
    "- Query Planner: Takes a user's query (like the above) and generates a Query Plan as a tool/function\n",
    "  consisting of: (a) a SQL-like filter, (b) a possibly rephrased query, and (c) an optional Pandas computation.\n",
    "- A RAG Agent (powered by LanceDB) that executes the query plan combining\n",
    "  filtering, RAG, lexical search, and optional Pandas computation.\n",
    "- A Query Plan Critic that examines the Query Plan and the RAG response, and\n",
    "  suggests improvements to the Query Planner, if any.\n",
    "\n",
    "This system can answer questions such as the above.\n",
    "You can try it out in this notebook, with a dataset of\n",
    "IMDB movie ratings.\n",
    "\n",
    "If you want to run it as a script, see here:\n",
    "https://github.com/langroid/langroid-examples/blob/main/examples/docqa/lance-rag-movies.py\n",
    "\n"
   ],
   "metadata": {
    "id": "b9fHPojfnbPy"
   }
  },
  {
   "cell_type": "markdown",
   "source": [
 
```

#### 7. examples/kg-chat/DependencyChatbot.ipynb

```ipynb
package name in your questions.\n",
    "\n",
    "    After receiving this infomration, make sure the package version is a number and the\n",
    "    package type is PyPi.\n",
    "    THEN ask the user if they want to construct the dependency graph,\n",
    "    and if so, use the tool/function `construct_dependency_graph` to construct\n",
    "      the dependency graph. Otherwise, say `Couldn't retrieve package type or version`\n",
    "      and {NO_ANSWER}.\n",
    "    After constructing the dependency graph successfully, you will have access to Neo4j\n",
    "    graph database, which contains dependency graph.\n",
    "    You will try your best to answer my questions. Note that:\n",
    "    1. You can use the tool `get_schema` to get node label and relationships in the\n",
    "    dependency graph.\n",
    "    2. You can use the tool `retrieval_query` to get relevant information from the\n",
    "      graph database. I will execute this query and send you back the result.\n",
    "      Make sure your queries comply with the database schema.\n",
    "    3. Use the `web_search` tool/function to get information if needed.\n",
    "    \"\"\"\n",
    "\n",
    "task = Task(\n",
    "    dependency_agent,\n",
    "    name=\"DependencyAgent\",\n",
    "    system_message=system_message,\n",
    ")\n",
    "\n",
    "dependency_agent.enable_message(DepGraphTool)\n",
    "dependency_agent.enable_message(GoogleSearchTool)\n",
    "task.set_color_log(enable=False)\n",
    "task.run()"
   ]
  }
 ],
 "metadata": {
  "colab": {
   "include_colab_link": true,
   "provenance": []
 
```

#### 8. docs/blog/posts/langroid-intro.md

```md
vector-stores.


## Highlights
- **Agents as first-class citizens:** The `Agent` class encapsulates LLM conversation state,
  and optionally a vector-store and tools. Agents are a core abstraction in Langroid;
  Agents act as _message transformers_, and by default provide 3 _responder_ methods, one corresponding to each
  entity: LLM, Agent, User.
- **Tasks:** A Task class wraps an Agent, gives the agent instructions (or roles, or goals),
  manages iteration over an Agent's responder methods,
  and orchestrates multi-agent interactions via hierarchical, recursive
  task-delegation. The `Task.run()` method has the same
  type-signature as an Agent's responder's methods, and this is key to how
  a task of an agent can delegate to other sub-tasks: from the point of view of a Task,
  sub-tasks are simply additional responders, to be used in a round-robin fashion
  after the agent's own responders.
- **Modularity, Reusability, Loose coupling:** The `Agent` and `Task` abstractions allow users to design
  Agents with specific skills, wrap them in Tasks, and combine tasks in a flexible way.
- **LLM Support**: Langroid supports OpenAI LLMs including GPT-3.5-Turbo,
  GPT-4.
- **Caching of LLM prompts, responses:** Langroid by default uses [Redis](https://redis.com/try-free/) for caching.
- **Vector-stores**: [Qdrant](https://qdrant.tech/), [Chroma](https://www.trychroma.com/), LanceDB, Pinecone, PostgresDB (PGVector), Weaviate are currently supported.
  Vector stores allow for Retrieval-Augmented-Generaation (RAG).
- **Grounding and source-citation:** Access to external documents via vector-stores
  allows for grounding and source-citation.
- **Observability, Logging, Lineage:** Langroid generates detailed logs of multi-agent interactions and
  maintains provenance/lineage of messages, so that you can trace back
  the origin of a message.
- **Tools/Plugins/Function-calling**: Langroid supports OpenAI's recently
  released [function calling](https://platform.openai.com/docs/guides/gpt/function-calling)
  feature. In addition, Langroid has its own native equivalent, which we
  call **tools** (also known as "plugins" in other contexts). Function
  calling and tools have the same developer-facing interface, implemented
  using [Pydantic](https://docs.pydantic.dev/latest/),
  which makes it very easy to define tools/functions and enable agents
  to use them. Benefits of using Pydantic are that you never have to write
  complex JSON specs for function calling, and when the LLM
  hallucinates malformed JSON, the Pydantic error message is sent back to
  the LLM so 
```

#### 9. examples/Langroid_QuickStart_OpenAI_Assistants_API.ipynb

```ipynb
{
 "nbformat": 4,
 "nbformat_minor": 0,
 "metadata": {
  "colab": {
   "provenance": [],
   "authorship_tag": "ABX9TyP9+BJLzaiLp67cp7+DjUBb",
   "include_colab_link": true
  },
  "kernelspec": {
   "name": "python3",
   "display_name": "Python 3"
  },
  "language_info": {
   "name": "python"
  }
 },
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "view-in-github",
    "colab_type": "text"
   },
   "source": [
    "<a href=\"https://colab.research.google.com/github/langroid/langroid/blob/main/examples/Langroid_QuickStart_OpenAI_Assistants_API.ipynb\" target=\"_parent\"><img src=\"https://colab.research.google.com/assets/colab-badge.svg\" alt=\"Open In Colab\"/></a>"
   ]
  },
  {
   "cell_type": "markdown",
   "source": [
    "# Multi-Agent programming with Langroid, using the new OpenAI Assistant API\n",
    "\n",
    "OpenAI's [Assistants API](https://platform.openai.com/docs/assistants/overview) provides several conveniences to help build LLM applications, such as:\n",
    "- managing conversation state (threads)\n",
    "- persistent threads and assistants\n",
    "- tools (function-calling, retrieval, code-interpreter)\n",
    "\n",
    "\n",
    "There is a new programming paradigm emerging, where these assistants are primitives, and a key chalenge is:\n",
    "\n",
    "> how can you have these assistants collaborate to solve a task?\n",
    "\n",
    "[Langroid](https://github.com/langroid/langroid)'s new `OpenAIAssistant` class offers this ability. Langroid was designed from the start to support a multi-agent LLM programming paradigm, where agents can collaborate on a task via conversation.\n",
    "The new `OpenAIAssistant` agent gives you:\n",
    "\n",
    "- 1️⃣ a dead-simple interface to the Assistants API,\n",
    "- 2️⃣ a seamless way to have assistants collaborate with each other or with users.\n",
    "\n",
    "The Assistant API fits naturally into Langroid's notion of a `ChatAgent`,\n",
    "and the `OpenAIAssistant` class derives from `ChatAgent`.\n",
    "`OpenAIAssistant` can be used as a drop-in replacement for `ChatAgent` in any\n",
    "Langroid application, and leverage the **multi-agent** task orchestration built\n",
    "into Langroid.\n",
    "\n",
 
```

#### 10. examples/langroid_quick_examples.ipynb

```ipynb
it.\n",
    "\n",
    "Remember to keep hitting enter when it's the human's turn, and hit \"q\" to end the conversation."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "OMFDp8WxaAI3"
   },
   "outputs": [],
   "source": [
    "agent.message_history.clear()\n",
    "task = lr.Task(agent)\n",
    "task.set_color_log(enable=False)\n",
    "task.run()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "kZqX1J6qWhHk"
   },
   "source": [
    "# Tool/Function-calling to extract structured information from text\n",
    "\n",
    "Let's combine multi-agent interaction, Retrieval-Augmented Generation, and tools/function-calling, for a more realistic example. Suppose you want an agent to extract the key terms of a lease, from a lease document, as a nested JSON structure.\n",
    "This can be accomplished by instructing the LLM to use a specific tool.\n",
    "\n",
    "To simplify the solution, we separate the skills/responsibilities into two different Agents:\n",
    "- `LeaseExtractorAgent` has no access to the lease, and is responsible for gathering the key terms into a specific structured form\n",
    "- `DocChatAgent` has access to the lease and answers specific questions it receives from the `LeaseExtractorAgent`."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "from typing import List\n",
    "\n",
    "from pydantic import BaseModel"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "d-CkI7wk5A8l"
   },
   "source": [
    "Next, we define the desired structure of the lease information via Pydantic models. The desired format is a nested JSON structure, which maps to a nested class structure:\n"
   ]
  },
  {
   "cell_type": "code",
 
```

#### 11. examples/kg-chat/dependency_chatbot.py

```py
   
    FIRST, I'll give you the name of the package that I want to analyze.
    
    THEN, you can also use the `web_search` tool/function to find out information about a package,
      such as version number and package type (PyPi or not). 
    
    If unable to get this info, you can ask me and I can tell you.
    
    DON'T forget to include the package name in your questions. 
      
    After receiving this information, make sure the package version is a number and the
    package type is PyPi.
    THEN ask the user if they want to construct the dependency graph,
    and if so, use the tool/function `construct_dependency_graph` to construct
      the dependency graph. Otherwise, say `Couldn't retrieve package type or version`
      and {NO_ANSWER}.
    After constructing the dependency graph successfully, you will have access to Neo4j 
    graph database, which contains dependency graph.
    You will try your best to answer my questions. Note that:
    1. You can use the tool `get_schema` to get node label and relationships in the
    dependency graph. 
    2. You can use the tool `retrieval_query` to get relevant information from the
      graph database. I will execute this query and send you back the result.
      Make sure your queries comply with the database schema.
    3. Use the `web_search` tool/function to get information if needed.
    To display the dependency graph use this tool `visualize_dependency_graph`.
    """
    task_config = TaskConfig(addressing_prefix=SEND_TO)
    task = Task(
        dependency_agent,
        name="DependencyAgent",
    
```

#### 12. examples/Langroid_quick_start.ipynb

```ipynb
want to know.\n",
        "    \"\"\",\n",
        ")\n",
        "# run interactive loop (enter \"q\" or \"x\" to quit)\n",
        "task.run()\n"
      ],
      "metadata": {
        "id": "dazt7q3YGCLd"
      },
      "execution_count": null,
      "outputs": []
    },
    {
      "cell_type": "markdown",
      "source": [
        "## Example 6: 2-Agent system to extract structured info from a Lease Document\n",
        "Now we are ready to put together the various notions above, to build a two-agent system that illustrates uses of Tools, DocChatAgent (RAG) and Inter-agent collaboration (task delegation).\n",
        "\n",
        "The goal is to extract structured information from a Lease document.\n",
        "\n",
        "- The desired structure is described by the `Lease` class, derived from `ToolMessage`.\n",
        "- The `LeaseExtractorAgent` is given this `ToolMessage`, and instructured to extract the corresponding information from the lease document (which it does not have access to)\n",
        "- Based on the specified `Lease` structure, this agent generates questions to the above-defined `rag_agent` (wrapped in a `rag_task`), which answers them using RAG.\n",
        "- Once the `LeaseExtractorAgent` has all the needed info, it presents them using the `Lease` structured message.\n"
      ],
      "metadata": {
        "id": "yi9GppzlKae_"
      }
    },
    {
      "cell_type": 
```

#### 13. examples/kg-chat/DependencyChatbot.ipynb

```ipynb
"\n",
    "This is a rapidly growing field, especially in light of the significant increase in software supply chain attacks. It focuses primarily on understanding and managing the dependencies in your software supply chain. With the rise of open-source and third-party components in software development, the need for supply chain security has become more critical than ever. Organizations are now realizing the importance of vetting and monitoring the components and dependencies they rely on to ensure the integrity and security of their software. As this field continues to evolve, it will be essential for developers and organizations to stay proactive in addressing supply chain vulnerabilities and implementing robust security measures.\n",
    "\n",
    "Managing dependencies starts with the ability to identify direct and transitive dependencies. Normally, this involves obtaining the full dependency graph, and writing custom code to answer questions about dependencies. In this colab, we introduce a far simpler approach with 2 key innovations:\n",
    "- store the dependency graph in a graph-db, specifically neo4j,\n",
    "- use an LLM-powered Agent that translates a user's questions into the query language of neo4j (known as Cypher)\n"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "rLgfXQq7DDMJ"
   },
   "source": [
    "# PyPi Package Dependency Chatbot\n",
    "\n",
    "This application combines the power of LLM and Knowledge Graphs (KG) to create a Retrieval-Augmented Generation (RAG) application for improved understanding of dependencies.\n",
    "\n",
    "This application focuses on PyPi packages and relies on [DepsDev](https://deps.dev/) to obtain the dependencies for a given package. More details about this Chatbot can be found [HERE](https://github.com/langroid/langroid/tree/main/examples/kg-chat).\n",
    "\n",
    "## Dependency Chatbot Architecture\n",
    "\n",
    "![Arch](https://github.com/langroid/langroid/blob/main/docs/assets/DepChatbot.png?raw=true)\n",
    "\n",
    "The chatbot comprises one agent `Neo4jChatAgent` that has access to three tools:\n",
    "\n",
    "1.   `GraphSchemaTool`: to get schema of Neo4j knowledge-graph.\n",
 
```

#### 14. README.md

```md
<div align="center">
  <img src="docs/assets/langroid-card-lambda-ossem-rust-1200-630.png" alt="Logo" 
        width="400" align="center">
</div>

<div align="center">

[![PyPI - Version](https://img.shields.io/pypi/v/langroid)](https://pypi.org/project/langroid/)
[![Downloads](https://img.shields.io/pypi/dm/langroid)](https://pypi.org/project/langroid/)
[![Pytest](https://github.com/langroid/langroid/actions/workflows/pytest.yml/badge.svg)](https://github.com/langroid/langroid/actions/workflows/pytest.yml)
[![codecov](https://codecov.io/gh/langroid/langroid/graph/badge.svg)](https://codecov.io/gh/langroid/langroid)
[![Multi-Architecture DockerHub](https://github.com/langroid/langroid/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/langroid/langroid/actions/workflows/docker-publish.yml)

[![Static Badge](https://img.shields.io/badge/Documentation-blue?link=https%3A%2F%2Flangroid.github.io%2Flangroid%2F&link=https%3A%2F%2Flangroid.github.io%2Flangroid%2F)](https://langroid.github.io/langroid)
[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langroid/langroid/blob/main/examples/Langroid_quick_start.ipynb)
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=flat&logo=discord&logoColor=white)](https://discord.gg/ZU36McDgDs)
[![Substack](https://img.shields.io/badge/Substack-%23006f5c.svg?style=flat&logo=substack&logoColor=FF6719)](https://langroid.substack.com/p/langroid-harness-llms-with-multi-agent-programming)

[![GitMCP](https://img.shields.io/endpoint?url=https://gitmcp.io/badge/OWNER/REPO)](https://gitmcp.io/langroid/langroid)
</div>

<h3 align="center">
  <a target="_blank" 
    href="https://langroid.github.io/langroid/" rel="dofollow">
      <strong>Documentation</strong></a>
  &middot;
  <a target="_blank" href="https://github.com/langroid/langroid-examples" rel="dofollow">
      <strong>Examples Repo</strong></a>
  &middot;
  <a target="_blank" href="https://discord.gg/ZU36McDgDs" rel="dofollow">
      <strong>Discord</strong></a>
  &middot;
  <a target="_blank" href="./CONTRIBUTING.md" rel="dofollow">
      <strong>Contributing</strong></a>

  <br />
</h3>

`Langroid` is an intuitive, lightweight, extensible and principled
Python framework to easily build LLM-powered applications, from CMU and UW-Madison researchers. 
You set up Agents, equip them with optional components (LLM, 
vector-store and tools/functions), assign them tasks, and have them 
collaboratively solve a problem by exchanging messages. 
This Multi-Agent paradigm is inspired by the
[Actor Framework](https://en.wikipedia.org/wiki/Actor_model)
(but you do not need to know anything about this!). 

`Langroid` is a fresh take on LLM app-development, where considerable thought has gone 
into simplifying the developer experience; 
it does not use `Langchain`, or any other LLM framework, 
and works with [practically any LLM](https://langroid.github.io/langroid/tutorials/supported-models/).

:fire: Read the (WIP) [overview of the langroid architecture](https://langroid.github.io/langroid/blog/2024/08/15/overview-of-langroids-multi-agent-architecture-prelim/), 
 and a [quick tour of Langroid](https://langroid.github.io/langroid/tutorials/langroid-tour/).

:fire: MCP Support: Allow any LLM-Agent to leverage MCP Servers via Langroid's simple
[MCP tool adapter](https://langroid.github.io/langroid/notes/mcp-tools/) that converts 
the server's tools into Langroid's `ToolMessage` instances.

📢 Companies are using/adapting Langroid in **production**. Here is a quote:

>[Nullify](https://www.nullify.ai) uses AI Agents for secure software development. 
> It finds, prioritizes and fixes vulnerabilities. We have internally adapted Langroid's multi-agent orchestration framework in production, after evaluating CrewAI, Autogen, LangChain, Langflow, etc. We found Langroid to be far superior to those frameworks in terms of ease of setup and flexibility. Langroid's Agent and Task abstractions are intuitive, well thought out, and provide a great developer  experience. We wanted the quickest way to get something in production. With other frameworks it would have taken us weeks, but with Langroid we got to good results in minutes. Highly recommended! <br> -- Jacky Wong, Head of AI at Nullify.


:fire: See this [Intro to Langroid](https://lancedb.substack.com/p/langoid-multi-agent-programming-framework)
blog post from the LanceDB team

:fire: Just published in ML for Healthcare (2024): a Langroid-based 
```

#### 15. examples/kg-chat/DependencyChatbot.ipynb

```ipynb
   "    ```\n",
    "\n",
    "**NOTE:** You can setup a free account at [Neo4j Aura](https://neo4j.com/cloud/platform/aura-graph-database/) to get access to Neo4j graph database.\n"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "aNbeze7LNiQa"
   },
   "source": [
    "## Install, setup, import"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "k_wFJ06tA_8t"
   },
   "outputs": [],
   "source": [
    "# Silently install Langroid, suppress all output (~2-4 mins)\n",
    "!pip install -q --upgrade langroid &> /dev/null"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "XorXx9GbPITC"
   },
   "outputs": [],
   "source": [
    "# Silently install Neo4j, suppress all output\n",
    "!pip install -q langroid[neo4j] &> /dev/null"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "TmcOOLLeQC1t"
   },
   "source": [
    "## Environment settings\n",
    "\n",
    "This code will ask the user to provide the `OPENAI_API_KEY`, `GOOGLE_API_KEY`, and `GOOGLE_CSE_ID`."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "7T_R8_HWQShi"
   },
   "outputs": [],
   "source": [
    "# OpenAI API Key: Enter your key in the dialog box that will show up below\n",
    "# NOTE: colab often struggles with showing this input box,\n",
    "# if so, simply insert your API key in this cell, though it's not ideal.\n",
    "import os\n",
    "from getpass import getpass\n",
    "\n",
    "os.environ['OPENAI_API_KEY'] = getpass('Enter your OPENAI_API_KEY key:', stream=None)"
   ]
  },
  {
   
```

#### 16. ai-notes/Langroid-repo-docs.md

```md
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- Install core dependencies: `pip install -e .`
- Install dev dependencies: `pip install -e ".[dev]"`
- Install specific feature groups:
  - Document chat features: `pip install -e ".[doc-chat]"`
  - Database features: `pip install -e ".[db]"`
  - HuggingFace embeddings: `pip install -e ".[hf-embeddings]"`
  - All features: `pip install -e ".[all]"`
- Run linting and type checking: `make check`
- Format code: `make lint`

### Testing
- Run all tests: `pytest tests/`
- Run specific test: `pytest tests/main/test_file.py::test_function`
- Run tests with coverage: `pytest --cov=langroid tests/`
- Run only main tests: `make tests` (uses `pytest tests/main`)

### Linting and Type Checking
- Lint code: `make check` (runs black, ruff check, mypy)
- Format only: `make lint` (runs black and ruff fix)
- Type check only: `make type-check`
- Always use `make check` to run lints + mypy before trying to commit changes

### Version and Release Management
- Bump version: `./bump_version.sh [patch|minor|major]`
- Or use make commands:
  - `make all-patch` - Bump patch version, build, push, release
  - `make all-minor` - Bump minor version, build, push, release
  - `make all-major` - Bump major version, build, push, release

## Architecture

Langroid is a framework for building LLM-powered agents that can use tools and collaborate with each other.

### Core Components:

1. **Agents** (`langroid/agent/`):
   - `chat_agent.py` - Base ChatAgent that can converse and use tools
   - `task.py` - Handles execution flow for agents
   - `special/` - Domain-specific agents (doc chat, table chat, SQL chat, etc.)
   - `openai_assistant.py` - Integration with OpenAI Assistant API

2. **Tools** (`langroid/agent/tools/`):
   - Tool system for agents to interact with external systems
   - `tool_message.py` - Protocol for tool messages
   - Various search tools (Google, DuckDuckGo, Tavily, Exa, etc.)

3. **Language Models** (`langroid/language_models/`):
   - Abstract interfaces for different LLM providers
   - Implementations for OpenAI, Azure, local models, etc.
   - Support for hundreds of LLMs via LiteLLM

4. **Vector Stores** (`langroid/vector_store/`):
   - Abstract interface and implementations for different vector databases
   - Includes support for Qdrant, Chroma, LanceDB, 
```

#### 17. CLAUDE.md

```md
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- Install core dependencies: `pip install -e .`
- Install dev dependencies: `pip install -e ".[dev]"`
- Install specific feature groups:
  - Document chat features: `pip install -e ".[doc-chat]"`
  - Database features: `pip install -e ".[db]"`
  - HuggingFace embeddings: `pip install -e ".[hf-embeddings]"`
  - All features: `pip install -e ".[all]"`
- Run linting and type checking: `make check`
- Format code: `make lint`

### Testing
- Run all tests: `pytest tests/`
- Run specific test: `pytest tests/main/test_file.py::test_function`
- Run tests with coverage: `pytest --cov=langroid tests/`
- Run only main tests: `make tests` (uses `pytest tests/main`)

### Linting and Type Checking
- Lint code: `make check` (runs black, ruff check, mypy)
- Format only: `make lint` (runs black and ruff fix)
- Type check only: `make type-check`
- Always use `make check` to run lints + mypy before trying to commit changes

### Version and Release Management
- Bump version: `./bump_version.sh [patch|minor|major]`
- Or use make commands:
  - `make all-patch` - Bump patch version, build, push, release
  - `make all-minor` - Bump minor version, build, push, release
  - `make all-major` - Bump major version, build, push, release

## Architecture

Langroid is a framework for building LLM-powered agents that can use tools and collaborate with each other.

### Core Components:

1. **Agents** (`langroid/agent/`):
   - `chat_agent.py` - Base ChatAgent that can converse and use tools
   - `task.py` - Handles execution flow for agents
   - `special/` - Domain-specific agents (doc chat, table chat, SQL chat, etc.)
   - `openai_assistant.py` - Integration with OpenAI Assistant API

2. **Tools** (`langroid/agent/tools/`):
   - Tool system for agents to interact with external systems
   - `tool_message.py` - Protocol for tool messages
   - Various search tools (Google, DuckDuckGo, Tavily, Exa, etc.)

3. **Language Models** (`langroid/language_models/`):
   - Abstract interfaces for different LLM providers
   - Implementations for OpenAI, Azure, local models, etc.
   - Support for hundreds of LLMs via LiteLLM

4. **Vector Stores** (`langroid/vector_store/`):
   - Abstract interface and implementations for different vector databases
   - Includes support for Qdrant, Chroma, LanceDB, 
```

#### 18. mkdocs.yml

```yml
Delegation: quick-start/multi-agent-task-delegation.md
    - Two Agent Chat: quick-start/two-agent-chat-num.md
    - Three Agent Chat: quick-start/three-agent-chat-num.md
    - Agent with Tools/Functions: quick-start/chat-agent-tool.md
    - Three Agents, with Routing: quick-start/three-agent-chat-num-router.md
    - Agent with Retrieval: quick-start/chat-agent-docs.md
  # defer to gen-files + literate-nav
  - FAQ: FAQ.md
  - Notes-Updates:
      - Overview: notes/overview.md
      - XML-based Tools: notes/xml-tools.md
      - Async Streaming: notes/async-streaming.md
      - Knowledge Graphs: notes/knowledge-graphs.md
      - Gemini LLMs, Embeddings: notes/gemini.md
      - LLM-based Pdf Parsing: notes/llm-pdf-parser.md
      - Large Tool Results: notes/large-tool-results.md
      - GLHF.chat Support: notes/glhf-chat.md
      - Structured Output: notes/structured-output.md
      - Tool Handlers: notes/tool-message-handler.md
      - Task Termination: notes/task-termination.md
      - Llama.cpp Embeddings: notes/llama-cpp-embeddings.md
      - Azure OpenAI models: notes/azure-openai-models.md
      - Custom Azure OpenAI client: notes/custom-azure-client.md
      - Enriching Chunks for Retrieval: notes/enriching-for-retrieval.md
      - Reasoning Content: notes/reasoning-content.md
      - Weaviate: notes/weaviate.md
      - Handling LLM Non-Tool Messages: notes/handle-llm-no-tool.md
      - PGVector: notes/pgvector.md
      - Pinecone: notes/pinecone.md
      - Tavily Search Tool: notes/tavily_search.md
      - Marker Pdf Parser: notes/marker-pdf.md
      - URLLoader : notes/url_loader.md
      - LangDB AI Gateway: notes/langdb.md
      - Portkey AI Gateway: notes/portkey.md
      - Markitdown Parsers: notes/markitdown.md
      - LiteLLM Proxy: notes/litellm-proxy.md
      - Chunking: notes/chunking.md
      - Image, PDF Input: notes/file-input.md
      - MCP Tools: notes/mcp-tools.md
      - Code-Injection Protection: notes/code-injection-protection.md
     
```

#### 19. README.md

```md
of the many features of Langroid, such as:
- Multi-agent collaboration: `LeaseExtractor` is in charge of the task, and its LLM (GPT4) generates questions 
to be answered by the `DocAgent`.
- Retrieval augmented question-answering, with **source-citation**: `DocAgent` LLM (GPT4) uses retrieval from a vector-store to 
answer the `LeaseExtractor`'s questions, cites the specific excerpt supporting the answer. 
- Function-calling (also known as tool/plugin): When it has all the information it 
needs, the `LeaseExtractor` LLM presents the information in a structured 
format using a Function-call. 

Here is what it looks like in action 
(a pausable mp4 video is [here](https://vimeo.com/871429249)).

![Demo](docs/assets/demos/lease-extractor-demo.gif)


# :zap: Highlights
(For a more up-to-date list see the 
[Updates/Releases](https://github.com/langroid/langroid?tab=readme-ov-file#fire-updatesreleases) 
section above)
- **Agents as first-class citizens:** The [Agent](https://langroid.github.io/langroid/reference/agent/base/#langroid.agent.base.Agent) class encapsulates LLM conversation state,
  and optionally a vector-store and tools. Agents are a core abstraction in Langroid;
  Agents act as _message transformers_, and by default provide 3 _responder_ methods, one corresponding to each entity: LLM, Agent, User.
- **Tasks:** A [Task](https://langroid.github.io/langroid/reference/agent/task/) class wraps an Agent, and gives the agent instructions (or roles, or goals), 
  manages iteration over an Agent's responder methods, 
  and orchestrates multi-agent interactions via hierarchical, recursive
  task-delegation. The `Task.run()` method has the same 
  type-signature as an Agent's responder's methods, and this is key to how 
  a task of an agent can delegate to other sub-tasks: from the point of view of a Task,
  sub-tasks are simply additional responders, to be used in a round-robin fashion 
  after the agent's own responders.
- **Modularity, Reusability, Loose coupling:** The `Agent` and `Task` abstractions allow users to design
  Agents with specific skills, wrap them in Tasks, and combine tasks in a flexible way.
- **LLM Support**: Langroid supports OpenAI LLMs as well as LLMs from hundreds of 
providers ([local/open](https://langroid.github.io/langroid/tutorials/local-llm-setup/) or [remote/commercial](https://langroid.github.io/langroid/tutorials/non-openai-llms/)) via proxy libraries and local model servers
such as [ollama](https://github.com/ollama), [oobabooga](https://github.com/oobabooga/text-generation-webui), 
  [LiteLLM](https://docs.litellm.ai/docs/providers) that in effect mimic the OpenAI API. See the [supported LLMs](https://langroid.github.io/langroid/tutorials/supported-models/). 
- **Caching of LLM responses:** Langroid supports [Redis](https://redis.com/try-free/) to cache LLM responses.
- **Vector-stores**: [Qdrant](https://qdrant.tech/), [Chroma](https://www.trychroma.com/), LanceDB, Pinecone, PostgresDB (PGVector), Weaviate are currently supported.
  Vector stores allow for Retrieval-Augmented-Generation (RAG).
- **Grounding and 
```

#### 20. examples/langroid_quick_examples.ipynb

```ipynb
   "\n",
    "logging.getLogger().setLevel(logging.ERROR)\n",
    "nest_asyncio.apply()\n",
    "\n",
    "from getpass import getpass\n",
    "\n",
    "os.environ['OPENAI_API_KEY'] = getpass('Enter your OPENAI_API_KEY key: ')"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "Tw5RzVKl3pUr"
   },
   "source": [
    "**Now you can can try any of the following examples. It is recommended to go through these in sequence, although the order does NOT matter.**\n",
    "\n",
    "---"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "5rBWNOuXEygx"
   },
   "source": [
    "# Direct interaction with OpenAI LLM\n",
    "\n",
    "In this simple example, we are directly sending a message-sequence to the OpenAI `chatCompletion` API. Note that to have a multi-round converation we have to manually accumulate the dialog.\n",
    "\n",
    "First, import `langroid`."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "lGY2XyHyD0oJ",
    "scrolled": true
   },
   "outputs": [],
   "source": [
    "import langroid as lr"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "llm = lr.language_models.OpenAIGPT()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "bMR6Dani_l9C"
   },
   "source": [
    "We define the LLM model using `OpenAIGPT`; you can optionally pass an `OpenAIGPTConfig` to set the configurations of the OpenAI LLM model.\n",
    "\n",
    "We can also specify the messages that will be sent to instruct the model. `Langroid` supports various roles provided by OpenAI."
   ]
  },
  {
  
```

