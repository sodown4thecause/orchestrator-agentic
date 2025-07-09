# Chat with humanlayer/12-factor-agents

## You

what are the main features of the project, show me the most important files in the codebase and explain the tech stack and architecture. 

## AI

## Main Features (The 12 Factors)

The project, "12-Factor Agents", outlines principles for building reliable, production-grade LLM-powered software. Inspired by the 12 Factor App methodology, its core features are the 12 factors (plus one honorable mention) that serve as guidelines:

1.  **Natural Language to Tool Calls**: Design agents to translate natural language requests into structured tool calls.
2.  **Own your prompts**: Treat prompts as first-class code, maintaining full control over their content and structure.
3.  **Own your context window**: Manage and structure the context provided to the LLM effectively.
4.  **Tools are just structured outputs**: View tool calls as structured data outputs from the LLM.
5.  **Unify execution state and business state**: Keep the agent's operational state and the application's business state consistent.
6.  **Launch/Pause/Resume with simple APIs**: Design agents with clear APIs for managing their lifecycle.
7.  **Contact humans with tool calls**: Use tool calls as a mechanism for the agent to interact with human users.
8.  **Own your control flow**: Implement deterministic control flow outside the LLM where possible.
9.  **Compact Errors into Context Window**: Summarize and structure errors efficiently for inclusion in the context.
10. **Small, Focused Agents**: Build modular agents with specific, limited responsibilities.
11. **Trigger from anywhere, meet users where they are**: Design agents to be invoked and interact across various platforms.
12. **Make your agent a stateless reducer**: Model the agent's core logic as a function that transforms state based on input.

*   **Honorable Mention (Factor 13)**: Pre-fetch all the context you might need.

## Architecture Philosophy

The project advocates for building agents primarily as software applications with strategic integration of LLM steps, rather than relying solely on the "prompt, tools, loop" pattern. It suggests that good agents are often structured like Directed Graphs (DGs) or DAGs, emphasizing deterministic code for control flow and state management, with LLMs used for specific tasks like natural language interpretation or structured output generation.

## Tech Stack

The principles themselves are largely technology-agnostic. However, the examples and tools within the repository utilize:

*   **TypeScript / Node.js**: Used for the example code and the `walkthroughgen` tool.
*   **BAML**: A tool used in examples for generating structured prompts.
*   **HumanLayer SDK**: Demonstrated in workshops for managing agent workflows and human interaction.

## Most Important Files and Directories

*   `README.md`: The main entry point to the project, introducing the concepts and listing the 12 factors.
*   `content/`: Contains the detailed markdown files (`factor-*.md`) explaining each of the 12 principles in depth.
*   `packages/walkthroughgen/`: This directory holds the source code for the `walkthroughgen` tool, used to generate the step-by-step guides and documentation within the repository. Key files include `readme.md` (tool documentation) and `package.json` (dependencies).
*   `workshops/`: Contains practical examples and walkthroughs demonstrating how to apply the principles in code, such as the workshops using TypeScript and the HumanLayer SDK.

These files and directories collectively provide the core documentation, explanation, and practical examples of the 12-factor agents methodology.


### Assistant's Reasoning

The user is asking for the main features, important files, tech stack, and architecture of the 12-factor agents project based on the provided context. I will extract this information from the context files, primarily the README and the factor content files, and structure it into a clear markdown response.",
    "answer": "## Main Features (The 12 Factors)\n\nThe project, \"12-Factor Agents\", outlines principles for building reliable, production-grade LLM-powered software. Inspired by the 12 Factor App methodology, its core features are the 12 factors (plus one honorable mention) that serve as guidelines:\n\n1.  **Natural Language to Tool Calls**: Design agents to translate natural language requests into structured tool calls.\n2.  **Own your prompts**: Treat prompts as first-class code, maintaining full control over their content and structure.\n3.  **Own your context window**: Manage and structure the context provided to the LLM effectively.\n4.  **Tools are just structured outputs**: View tool calls as structured data outputs from the LLM.\n5.  **Unify execution state and business state**: Keep the agent's operational state and the application's business state consistent.\n6.  **Launch/Pause/Resume with simple APIs**: Design agents with clear APIs for managing their lifecycle.\n7.  **Contact humans with tool calls**: Use tool calls as a mechanism for the agent to interact with human users.\n8.  **Own your control flow**: Implement deterministic control flow outside the LLM where possible.\n9.  **Compact Errors into Context Window**: Summarize and structure errors efficiently for inclusion in the context.\n10. **Small, Focused Agents**: Build modular agents with specific, limited responsibilities.\n11. **Trigger from anywhere, meet users where they are**: Design agents to be invoked and interact across various platforms.\n12. **Make your agent a stateless reducer**: Model the agent's core logic as a function that transforms state based on input.\n\n*   **Honorable Mention (Factor 13)**: Pre-fetch all the context you might need.\n\n## Architecture Philosophy\n\nThe project advocates for building agents primarily as software applications with strategic integration of LLM steps, rather than relying solely on the "prompt, tools, loop" pattern. It suggests that good agents are often structured like Directed Graphs (DGs) or DAGs, emphasizing deterministic code for control flow and state management, with LLMs used for specific tasks like natural language interpretation or structured output generation.\n\n## Tech Stack\n\nThe principles themselves are largely technology-agnostic. However, the examples and tools within the repository utilize:\n\n*   **TypeScript / Node.js**: Used for the example code and the `walkthroughgen` tool.\n*   **BAML**: A tool used in examples for generating structured prompts.\n*   **HumanLayer SDK**: Demonstrated in workshops for managing agent workflows and human interaction.\n\n## Most Important Files and Directories\n\n*   `README.md`: The main entry point to the project, introducing the concepts and listing the 12 factors.\n*   `content/`: Contains the detailed markdown files (`factor-*.md`) explaining each of the 12 principles in depth.\n*   `packages/walkthroughgen/`: This directory holds the source code for the `walkthroughgen` tool, used to generate the step-by-step guides and documentation within the repository. Key files include `readme.md` (tool documentation) and `package.json` (dependencies).\n*   `workshops/`: Contains practical examples and walkthroughs demonstrating how to apply the principles in code, such as the workshops using TypeScript and the HumanLayer SDK.\n\nThese files and directories collectively provide the core documentation, explanation, and practical examples of the 12-factor agents methodology.\n

### Source Code References

#### 1. content/factor-02-own-your-prompts.md

```md
  - Check current deployment status
    - Verify the deployment tag exists
    - Request approval if needed
    - Deploy to staging before production
    - Monitor deployment progress
    
    {{ _.role("user") }}

    {{ thread }}
    
    What should the next step be?
  "#
}
```

(the above example uses [BAML](https://github.com/boundaryml/baml) to generate the prompt, but you can do this with any prompt engineering tool you want, or even just template it manually)

If the signature looks a little funny, we'll get to that in [factor 4 - tools are just structured outputs](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-04-tools-are-structured-outputs.md)

```typescript
function DetermineNextStep(thread: string) -> DoneForNow | ListGitTags | DeployBackend | DeployFrontend | RequestMoreInformation {
```

Key benefits of owning your prompts:

1. **Full Control**: Write exactly the instructions your agent needs, no black box abstractions
2. **Testing and Evals**: Build tests and evals for your prompts just like you would for any other code
3. **Iteration**: Quickly modify prompts based on real-world performance
4. **Transparency**: Know exactly what instructions your agent is working with
5. **Role Hacking**: take advantage of APIs that support nonstandard usage of user/assistant roles - for example, the now-deprecated non-chat flavor of OpenAI "completions" API. This includes some so-called "model gaslighting" techniques

Remember: Your prompts are the primary interface between your application logic and the LLM.

Having full control over your prompts gives you the flexibility and prompt control you need for production-grade agents.

I don't know what's the best prompt, but I know you want the flexibility to be able to try EVERYTHING.

[← Natural Language To Tool Calls](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-01-natural-language-to-tool-calls.md) | [Own Your Context Window →](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-03-own-your-context-window.md)

```

#### 2. packages/walkthroughgen/test/e2e/test-e2e.ts

```ts
  }
        }
\`\`\`

</details>

Install dependencies

    npm install

You should see packages being installed

    added 123 packages
    `.trim());
      expect(output).toContain("Successfully generated walkthrough");
    });
  });
});

describe("CLI generate from example", () => {
  it("should generate markdown from the typescript example", () => {
    withTmpDir((tempDir: string) => {
      const exampleBasePath = path.resolve(__dirname, '../../examples/typescript');
      const exampleWalkthroughDir = path.join(exampleBasePath, 'walkthrough');
      
      // Copy walkthrough.yaml
      const sourceYamlPath = path.join(exampleBasePath, 'walkthrough.yaml');
      const destYamlPath = path.join(tempDir, 'walkthrough.yaml');
      fs.copyFileSync(sourceYamlPath, destYamlPath);

      // Copy walkthrough directory recursively
      const destWalkthroughSubDir = path.join(tempDir, 'walkthrough');
      fs.cpSync(exampleWalkthroughDir, destWalkthroughSubDir, { recursive: true });

      // Run CLI
      const output = withMockedConsole(() => {
        cli(["generate", destYamlPath]);
      });

      // Assertions
      const expectedMarkdownPath = path.join(tempDir, 'build/walkthrough.md');
      expect(fs.existsSync(expectedMarkdownPath)).toBe(true);
      expect(output).toContain("Successfully generated walkthrough");

      // Content checks
      const markdownContent = fs.readFileSync(expectedMarkdownPath, 'utf8').replace(/\r\n/g, '\n');
      expect(markdownContent).toContain("# setting up a typescript cli");
      expect(markdownContent).toContain("## Copy initial files");
      expect(markdownContent).toContain("cp ./walkthrough/00-package.json package.json");
    });
  });
});

describe("CLI generate with diffs", () => {
  it("should show diffs when files are overwritten", () => {
    withTmpDir((tempDir: string) => {
      fs.mkdirSync(path.join(tempDir, 'walkthrough'), { recursive: true });
      
      // Create initial package.json
      fs.writeFileSync(
        path.join(tempDir, 'walkthrough/v1-package.json'),
      
```

#### 3. README.md

```md
truly magical.

Agents, at least the good ones, don't follow the ["here's your prompt, here's a bag of tools, loop until you hit the goal"](https://www.anthropic.com/engineering/building-effective-agents#agents) pattern. Rather, they are comprised of mostly just software. 

So, I set out to answer:

> ### **What are the principles we can use to build LLM-powered software that is actually good enough to put in the hands of production customers?**

Welcome to 12-factor agents. As every Chicago mayor since Daley has consistently plastered all over the city's major airports, we're glad you're here.

*Special thanks to [@iantbutler01](https://github.com/iantbutler01), [@tnm](https://github.com/tnm), [@hellovai](https://www.github.com/hellovai), [@stantonk](https://www.github.com/stantonk), [@balanceiskey](https://www.github.com/balanceiskey), [@AdjectiveAllison](https://www.github.com/AdjectiveAllison), [@pfbyjy](https://www.github.com/pfbyjy), [@a-churchill](https://www.github.com/a-churchill), and the SF MLOps community for early feedback on this guide.*

## The Short Version: The 12 Factors

Even if LLMs [continue to get exponentially more powerful](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-10-small-focused-agents.md#what-if-llms-get-smarter), there will be core engineering techniques that make LLM-powered software more reliable, more scalable, and easier to maintain.

- [How We Got Here: A Brief History of Software](https://github.com/humanlayer/12-factor-agents/blob/main/content/brief-history-of-software.md)
- [Factor 1: Natural Language to Tool Calls](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-01-natural-language-to-tool-calls.md)
- [Factor 2: Own your prompts](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-02-own-your-prompts.md)
- [Factor 3: Own your context window](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-03-own-your-context-window.md)
- [Factor 4: Tools are just structured outputs](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-04-tools-are-structured-outputs.md)
- [Factor 5: Unify execution state and business state](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-05-unify-execution-state.md)
- [Factor 6: Launch/Pause/Resume with simple APIs](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-06-launch-pause-resume.md)
- [Factor 7: Contact humans with tool calls](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-07-contact-humans-with-tools.md)
- [Factor 8: Own your control flow](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-08-own-your-control-flow.md)
- [Factor 9: Compact Errors into Context Window](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-09-compact-errors.md)
- [Factor 10: Small, Focused Agents](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-10-small-focused-agents.md)
- [Factor 11: Trigger from anywhere, meet users where they are](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-11-trigger-from-anywhere.md)
- [Factor 12: Make your agent a stateless reducer](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-12-stateless-reducer.md)

### Visual Nav

|    |    |    |
|----|----|-----|
|[![factor 1](https://github.com/humanlayer/12-factor-agents/blob/main/img/110-natural-language-tool-calls.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-01-natural-language-to-tool-calls.md) | [![factor 2](https://github.com/humanlayer/12-factor-agents/blob/main/img/120-own-your-prompts.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-02-own-your-prompts.md) | [![factor 3](https://github.com/humanlayer/12-factor-agents/blob/main/img/130-own-your-context-building.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-03-own-your-context-window.md) |
|[![factor 4](https://github.com/humanlayer/12-factor-agents/blob/main/img/140-tools-are-just-structured-outputs.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-04-tools-are-structured-outputs.md) | [![factor 5](https://github.com/humanlayer/12-factor-agents/blob/main/img/150-unify-state.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-05-unify-execution-state.md) | [![factor 6](https://github.com/humanlayer/12-factor-agents/blob/main/img/160-pause-resume-with-simple-apis.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-06-launch-pause-resume.md) |
| [![factor 7](https://github.com/humanlayer/12-factor-agents/blob/main/img/170-contact-humans-with-tools.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-07-contact-humans-with-tools.md) | [![factor 8](https://github.com/humanlayer/12-factor-agents/blob/main/img/180-control-flow.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-08-own-your-control-flow.md) | [![factor 9](https://github.com/humanlayer/12-factor-agents/blob/main/img/190-factor-9-errors-static.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-09-compact-errors.md) |
| [![factor 10](https://github.com/humanlayer/12-factor-agents/blob/main/img/1a0-small-focused-agents.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-10-small-focused-agents.md) | [![factor 11](https://github.com/humanlayer/12-factor-agents/blob/main/img/1b0-trigger-from-anywhere.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-11-trigger-from-anywhere.md) | [![factor 12](https://github.com/humanlayer/12-factor-agents/blob/main/img/1c0-stateless-reducer.png)](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-12-stateless-reducer.md) |

## How we got here

For a deeper dive on my agent journey and what led us here, check out [A Brief History of Software](https://github.com/humanlayer/12-factor-agents/blob/main/content/brief-history-of-software.md) - a quick summary here:

### The promise of agents

We're gonna talk a lot about Directed Graphs (DGs) and their Acyclic friends, DAGs. I'll start by pointing out that...well...software is a directed graph. There's a reason we used to represent programs as flow charts.

![010-software-dag](https://github.com/humanlayer/12-factor-agents/blob/main/img/010-software-dag.png)

### From code to DAGs

Around 20 years 
```

#### 4. README.md

```md
 - [The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
  - [Mailcrew Agent](https://github.com/dexhorthy/mailcrew)
  - [Mailcrew Demo Video](https://www.youtube.com/watch?v=f_cKnoPC_Oo)
  - [Chainlit Demo](https://x.com/chainlit_io/status/1858613325921480922)
  - [TypeScript for LLMs](https://www.linkedin.com/posts/dexterihorthy_llms-typescript-aiagents-activity-7290858296679313408-Lh9e)
  - [Schema Aligned Parsing](https://www.boundaryml.com/blog/schema-aligned-parsing)
  - [Function Calling vs Structured Outputs vs JSON Mode](https://www.vellum.ai/blog/when-should-i-use-function-calling-structured-outputs-or-json-mode)
  - [BAML on GitHub](https://github.com/boundaryml/baml)
  - [OpenAI JSON vs Function Calling](https://docs.llamaindex.ai/en/stable/examples/llm/openai_json_vs_function_calling/)
  - [Outer Loop Agents](https://theouterloop.substack.com/p/openais-realtime-api-is-a-step-towards)
  - [Airflow](https://airflow.apache.org/)
  - [Prefect](https://www.prefect.io/)
  - [Dagster](https://dagster.io/)
  - [Inngest](https://www.inngest.com/)
  - [Windmill](https://www.windmill.dev/)
  - [The AI Agent Index (MIT)](https://aiagentindex.mit.edu/)
  - [NotebookLM on Finding Model Capability Boundaries](https://open.substack.com/pub/swyx/p/notebooklm?selection=08e1187c-cfee-4c63-93c9-71216640a5f8)

## Contributors

Thanks to everyone who has contributed to 12-factor agents!

[<img src="https://avatars.githubusercontent.com/u/3730605?v=4&s=80" width="80px" alt="dexhorthy" />](https://github.com/dexhorthy) [<img src="https://avatars.githubusercontent.com/u/50557586?v=4&s=80" width="80px" alt="Sypherd" />](https://github.com/Sypherd) [<img src="https://avatars.githubusercontent.com/u/66259401?v=4&s=80" width="80px" alt="tofaramususa" />](https://github.com/tofaramususa) [<img src="https://avatars.githubusercontent.com/u/18105223?v=4&s=80" width="80px" alt="a-churchill" />](https://github.com/a-churchill) [<img src="https://avatars.githubusercontent.com/u/4084885?v=4&s=80" width="80px" alt="Elijas" />](https://github.com/Elijas) [<img src="https://avatars.githubusercontent.com/u/39267118?v=4&s=80" width="80px" alt="hugolmn" />](https://github.com/hugolmn) [<img src="https://avatars.githubusercontent.com/u/1882972?v=4&s=80" width="80px" alt="jeremypeters" />](https://github.com/jeremypeters)

[<img src="https://avatars.githubusercontent.com/u/380402?v=4&s=80" width="80px" alt="kndl" />](https://github.com/kndl) [<img src="https://avatars.githubusercontent.com/u/16674643?v=4&s=80" width="80px" alt="maciejkos" />](https://github.com/maciejkos) [<img src="https://avatars.githubusercontent.com/u/85041180?v=4&s=80" width="80px" alt="pfbyjy" />](https://github.com/pfbyjy) [<img src="https://avatars.githubusercontent.com/u/36044389?v=4&s=80" width="80px" alt="0xRaduan" />](https://github.com/0xRaduan) [<img src="https://avatars.githubusercontent.com/u/7169731?v=4&s=80" width="80px" alt="zyuanlim" />](https://github.com/zyuanlim) [<img src="https://avatars.githubusercontent.com/u/15862501?v=4&s=80" width="80px" alt="lombardo-chcg" />](https://github.com/lombardo-chcg) [<img src="https://avatars.githubusercontent.com/u/160066852?v=4&s=80" width="80px" alt="sahanatvessel" />](https://github.com/sahanatvessel)

## Versions


This is the current version of 12-factor agents, version 1.0. There is a draft of version 1.1  on the [v1.1 branch](https://github.com/humanlayer/12-factor-agents/tree/v1.1). There are a few [Issues to track work on v1.1](https://github.com/humanlayer/12-factor-agents/issues?q=is%3Aissue%20state%3Aopen%20label%3Aversion%3A%3A1.1).

 
## License

All content and images are licensed under a <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0 License</a>

Code is licensed under the <a href="https://www.apache.org/licenses/LICENSE-2.0">Apache 2.0 License</a>



```

#### 5. packages/walkthroughgen/test/e2e/test-e2e.ts

```ts
"walkthrough.yaml")]);

      // Check first section README
      const firstSectionPath = path.join(tempDir, 'build/sections/00-first-section');
      const firstReadme = fs.readFileSync(path.join(firstSectionPath, 'README.md'), 'utf8');
      expect(firstReadme).toContain("Add initial index.ts");
      expect(firstReadme).toContain("cp ./walkthrough/v1-index.ts src/index.ts");
      expect(firstReadme).toContain("<details>\n<summary>show file</summary>");
      expect(firstReadme).toContain("```ts\n// ./walkthrough/v1-index.ts");
      expect(firstReadme).toContain('console.log("hello");');

      // Check second section README
      const secondSectionPath = path.join(tempDir, 'build/sections/01-second-section');
      const secondReadme = fs.readFileSync(path.join(secondSectionPath, 'README.md'), 'utf8');
      expect(secondReadme).toContain("Update index.ts");
      expect(secondReadme).toContain("```diff\nsrc/index.ts\n+console.log(\"world\");");
      expect(secondReadme).toContain("<details>\n<summary>skip this step</summary>");
      expect(secondReadme).toContain("cp ./walkthrough/v2-index.ts src/index.ts");
    });
  });
});
```

#### 6. packages/walkthroughgen/prompt.md

```md
  ├── package.json
│   │   │   ├── package-lock.json
│   │   │   └── tsconfig.json
│   │   └── 01-add-cli # contains the files up to the START of section 1
│   │       ├── readme.md # contains steps for this section
│   │       ├── package.json
│   │       ├── package-lock.json
│   │       ├── tsconfig.json
│   │       └── src
│   │           └── index.ts
│   ├── final
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── cli.ts
│   │       └── index.ts
│   └── walkthrough.md

and your walkthrough.md file will look like:

```markdown
# Setting up a typescript cli

this is a walkthrough for setting up a typescript cli

## Copy initial files

  cp walkthrough/00-package.json package.json
  cp walkthrough/00-package-lock.json package-lock.json
  cp walkthrough/00-tsconfig.json tsconfig.json

## Initialize the project

initialize the project

     npm install

then add index.ts


    cp walkthrough/01-index.ts src/index.ts

and run it with tsx

    npx tsx src/index.ts

you should see a hello world message

    hello world

## Add a CLI

add a cli

    ```
    ```
 
    cp walkthrough/02-cli.ts src/cli.ts

update index.ts to use the cli

    ```diff
      const main = async () => {
      +    return cli();
      };
        
      main();
    ```

    or just:

    cp walkthrough/02-index.ts src/index.ts

```

## Features

### Targets

- `file`: generates a single markdown file
- `folder`: creates a set 
```

#### 7. workshops/2025-05/walkthrough.md

```md
for xyz, resulting in 32.

as a final step, lets explore using a custom html template for the email


```diff
src/cli.ts
             email: {
                 address: process.env.HUMANLAYER_EMAIL,
+                // custom email body - jinja
+                template: `{% if type == 'request_more_information' %}
+{{ event.spec.msg }}
+{% else %}
+agent {{ event.run_id }} is requesting approval for {{event.spec.fn}}
+with args: {{event.spec.kwargs}}
+<br><br>
+reply to this email to approve
+{% endif %}`
             }
         }
```

<details>
<summary>skip this step</summary>

    cp ./walkthrough/11c-cli.ts src/cli.ts

</details>

first try with divide:


    npx tsx src/index.ts 'can you divide 4 by 5'

you should see a slightly different email with the custom template

![custom-template-email](https://github.com/humanlayer/12-factor-agents/blob/main/workshops/2025-05/walkthrough/11-email-custom.png?raw=true)

feel free to run with the flow and then you can try updating the template to your liking

(if you're using cursor, something as simple as highlighting the template and asking to "make it better"
should do the trick)

try triggering "request_more_information" as well!


thats it - in the next chapter, we'll build a fully email-driven 
workflow agent that uses webhooks for human approval 


## Chapter XX - HumanLayer Webhook Integration

the previous sections used the humanlayer SDK in "synchronous mode" - that 
means every time we wait for human approval, we sit in a loop 
polling until the human response if received.

That's obviously not ideal, especially for production workloads,
so in this section we'll implement [factor 6 - launch / pause / resume with simple APIs](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-6-launch-pause-resume.md)
by updating the server to end processing after contacting a human, and use webhooks to receive the results. 


add code to initialize humanlayer in the server


```diff
src/server.ts
 import { Thread, agentLoop, handleNextStep } from '../src/agent';
 import { ThreadStore } from '../src/state';
+import { humanlayer } from 'humanlayer';
 
 const app = express();
 const store = new ThreadStore();
 
+const getHumanlayer = () => {
+  
```

#### 8. packages/walkthroughgen/package.json

```json
{
  "name": "walkthroughgen",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "@boundaryml/baml": "^0.85.0",
    "@types/diff": "^7.0.2",
    "@types/js-yaml": "^4.0.9",
    "diff": "^7.0.0",
    "js-yaml": "^4.1.0",
    "typescript": "^5.8.3"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "jest": "^29.7.0",
    "ts-jest": "^29.3.2"
  }
}

```

#### 9. workshops/2025-05/sections/final/README.md

```md
src/cli.ts

lets test the require_approval flow as by asking for a calculation
with garbled input:


    npx tsx src/index.ts 'can you multiply 4 and xyz'

You should get an email with a request for clarification

    Can you clarify what 'xyz' represents in this context? Is it a specific number, variable, or something else?

you can response with something like

    use 8 instead of xyz

you should see a final result on the CLI like

    I have multiplied 4 and xyz, using the value 8 for xyz, resulting in 32.

as a final step, lets explore using a custom html template for the email


    cp ./walkthrough/11c-cli.ts src/cli.ts

first try with divide:


    npx tsx src/index.ts 'can you divide 4 by 5'

you should see a slightly different email with the custom template

![custom-template-email](https://github.com/humanlayer/12-factor-agents/blob/main/workshops/2025-05/walkthrough/11-email-custom.png?raw=true)

feel free to run with the flow and then you can try updating the template to your liking

(if you're using cursor, something as simple as highlighting the template and asking to "make it better"
should do the trick)

try triggering "request_more_information" as well!


thats it - in the next chapter, we'll build a fully email-driven 
workflow agent that uses webhooks for human approval 



# Chapter XX - HumanLayer Webhook Integration

the previous sections used the humanlayer SDK in "synchronous mode" - that 
means every time we wait for human approval, we sit in a loop 
polling until the human response if received.

That's obviously not ideal, especially for production workloads,
so in this section we'll implement [factor 6 - launch / pause / resume with simple APIs](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-6-launch-pause-resume.md)
by updating the server to end processing after contacting a human, and use webhooks to receive the results. 


add code to initialize humanlayer in the server


    cp ./walkthrough/12-1-server-init.ts src/server.ts

next, lets update the /thread endpoint to 
  
1. handle requests asynchronously, returning immediately
2. create a human contact on request_more_information and done_for_now calls


Update the server to be able to handle request_clarification responses

- remove the old /response endpoint and types
- update the /thread endpoint to run processing asynchronously, return immediately
- send a state.threadId when requesting human responses
- add a handleHumanResponse function 
```

#### 10. content/factor-02-own-your-prompts.md

```md
[← Back to README](https://github.com/humanlayer/12-factor-agents/blob/main/README.md)

### 2. Own your prompts

Don't outsource your prompt engineering to a framework. 

![120-own-your-prompts](https://github.com/humanlayer/12-factor-agents/blob/main/img/120-own-your-prompts.png)

By the way, [this is far from novel advice:](https://hamel.dev/blog/posts/prompt/)

![image](https://github.com/user-attachments/assets/575bab37-0f96-49fb-9ce3-9a883cdd420b)

Some frameworks provide a "black box" approach like this:

```python
agent = Agent(
  role="...",
  goal="...",
  personality="...",
  tools=[tool1, tool2, tool3]
)

task = Task(
  instructions="...",
  expected_output=OutputModel
)

result = agent.run(task)
```

This is great for pulling in some TOP NOTCH prompt engineering to get you started, but it is often difficult to tune and/or reverse engineer to get exactly the right tokens into your model.

Instead, own your prompts and treat them as first-class code:

```rust
function DetermineNextStep(thread: string) -> DoneForNow | ListGitTags | DeployBackend | DeployFrontend | RequestMoreInformation {
  prompt #"
    {{ _.role("system") }}
    
    You are a helpful assistant that manages deployments for frontend and backend systems.
    You work diligently to ensure safe and successful deployments by following best practices
    and proper deployment procedures.
    
    Before deploying any system, you should check:
    - The deployment environment (staging vs production)
    - The correct tag/version to deploy
    - The current system status
    
    You can use tools like deploy_backend, deploy_frontend, and check_deployment_status
    to manage deployments. For sensitive deployments, use request_approval to get
    human verification.
    
    Always think about what to do first, like:
    - Check current deployment status
    - Verify the deployment tag exists
    - Request approval if needed
    - Deploy to staging before production
    - Monitor deployment progress
    
    {{ _.role("user") }}

    {{ thread }}
    
    What should the next step be?
  "#
}
```

(the above example uses [BAML](https://github.com/boundaryml/baml) to generate the prompt, but you can do this with any prompt engineering tool you want, or even just template it manually)

If the signature looks 
```

#### 11. README.md

```md
if they don't have an AI background

> #### The fastest way I've seen for builders to get good AI software in the hands of customers is to take small, modular concepts from agent building, and incorporate them into their existing product


## The 12 Factors (again)


- [How We Got Here: A Brief History of Software](https://github.com/humanlayer/12-factor-agents/blob/main/content/brief-history-of-software.md)
- [Factor 1: Natural Language to Tool Calls](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-01-natural-language-to-tool-calls.md)
- [Factor 2: Own your prompts](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-02-own-your-prompts.md)
- [Factor 3: Own your context window](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-03-own-your-context-window.md)
- [Factor 4: Tools are just structured outputs](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-04-tools-are-structured-outputs.md)
- [Factor 5: Unify execution state and business state](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-05-unify-execution-state.md)
- [Factor 6: Launch/Pause/Resume with simple APIs](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-06-launch-pause-resume.md)
- [Factor 7: Contact humans with tool calls](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-07-contact-humans-with-tools.md)
- [Factor 8: Own your control flow](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-08-own-your-control-flow.md)
- [Factor 9: Compact Errors into Context Window](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-09-compact-errors.md)
- [Factor 10: Small, Focused Agents](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-10-small-focused-agents.md)
- [Factor 11: Trigger from anywhere, meet users where they are](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-11-trigger-from-anywhere.md)
- [Factor 12: Make your agent a stateless reducer](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-12-stateless-reducer.md)

## Honorable Mentions / other advice

- [Factor 13: Pre-fetch all the context you might need](https://github.com/humanlayer/12-factor-agents/blob/main/content/appendix-13-pre-fetch.md)

## Related Resources

- Contribute to this guide [here](https://github.com/humanlayer/12-factor-agents)
- [I talked about a lot of this on an episode of the Tool Use podcast](https://youtu.be/8bIHcttkOTE) in March 2025
- I write about some of this stuff at [The Outer Loop](https://theouterloop.substack.com)
- I do [webinars about Maximizing LLM Performance](https://github.com/hellovai/ai-that-works/tree/main) with [@hellovai](https://github.com/hellovai)
- We build OSS agents with this methodology under [got-agents/agents](https://github.com/got-agents/agents)
- We ignored all our own advice and built a [framework for running distributed agents in kubernetes](https://github.com/humanlayer/kubechain)
- Other links from this guide:
  - [12 Factor Apps](https://12factor.net)
  - [Building Effective Agents (Anthropic)](https://www.anthropic.com/engineering/building-effective-agents#agents)
  - [Prompts are Functions](https://thedataexchange.media/baml-revolution-in-ai-engineering/ )
  - [Library patterns: Why frameworks are evil](https://tomasp.net/blog/2015/library-frameworks/)
  - [The Wrong Abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction)
  - [Mailcrew Agent](https://github.com/dexhorthy/mailcrew)
  - [Mailcrew Demo Video](https://www.youtube.com/watch?v=f_cKnoPC_Oo)
  - [Chainlit Demo](https://x.com/chainlit_io/status/1858613325921480922)
  - [TypeScript for LLMs](https://www.linkedin.com/posts/dexterihorthy_llms-typescript-aiagents-activity-7290858296679313408-Lh9e)
  - [Schema Aligned Parsing](https://www.boundaryml.com/blog/schema-aligned-parsing)
  - [Function Calling vs Structured Outputs vs JSON Mode](https://www.vellum.ai/blog/when-should-i-use-function-calling-structured-outputs-or-json-mode)
  - [BAML on GitHub](https://github.com/boundaryml/baml)
  - [OpenAI JSON vs Function Calling](https://docs.llamaindex.ai/en/stable/examples/llm/openai_json_vs_function_calling/)
  - [Outer Loop Agents](https://theouterloop.substack.com/p/openais-realtime-api-is-a-step-towards)
  - [Airflow](https://airflow.apache.org/)
  - [Prefect](https://www.prefect.io/)
  - [Dagster](https://dagster.io/)
  - [Inngest](https://www.inngest.com/)
  - [Windmill](https://www.windmill.dev/)
  - [The AI Agent Index (MIT)](https://aiagentindex.mit.edu/)
  - [NotebookLM on Finding Model Capability Boundaries](https://open.substack.com/pub/swyx/p/notebooklm?selection=08e1187c-cfee-4c63-93c9-71216640a5f8)

## Contributors

Thanks to everyone who has contributed to 12-factor agents!

[<img src="https://avatars.githubusercontent.com/u/3730605?v=4&s=80" width="80px" alt="dexhorthy" />](https://github.com/dexhorthy) [<img src="https://avatars.githubusercontent.com/u/50557586?v=4&s=80" 
```

#### 12. README.md

```md
# 12-Factor Agents - Principles for building reliable LLM applications

<div align="center">
<a href="https://www.apache.org/licenses/LICENSE-2.0">
        <img src="https://img.shields.io/badge/Code-Apache%202.0-blue.svg" alt="Code License: Apache 2.0"></a>
<a href="https://creativecommons.org/licenses/by-sa/4.0/">
        <img src="https://img.shields.io/badge/Content-CC%20BY--SA%204.0-lightgrey.svg" alt="Content License: CC BY-SA 4.0"></a>
<a href="https://humanlayer.dev/discord">
    <img src="https://img.shields.io/badge/chat-discord-5865F2" alt="Discord Server"></a>
<a href="https://www.youtube.com/watch?v=8kMaTybvDUw">
    <img src="https://img.shields.io/badge/aidotengineer-conf_talk_(17m)-white" alt="YouTube
Deep Dive"></a>
<a href="https://www.youtube.com/watch?v=yxJDyQ8v6P0">
    <img src="https://img.shields.io/badge/youtube-deep_dive-crimson" alt="YouTube
Deep Dive"></a>
    
</div>

<p></p>

*In the spirit of [12 Factor Apps](https://12factor.net/)*.  *The source for this project is public at https://github.com/humanlayer/12-factor-agents, and I welcome your feedback and contributions. Let's figure this out together!*

> [!TIP]
> Missed the AI Engineer World's Fair? [Catch the talk here](https://www.youtube.com/watch?v=8kMaTybvDUw)
>
> Looking for Context Engineering? [Jump straight to factor 3](https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-03-own-your-context-window.md)


<img referrerpolicy="no-referrer-when-downgrade" src="https://static.scarf.sh/a.png?x-pxid=2acad99a-c2d9-48df-86f5-9ca8061b7bf9" />

<a href="#visual-nav"><img width="907" alt="Screenshot 2025-04-03 at 2 49 07 PM" src="https://github.com/user-attachments/assets/23286ad8-7bef-4902-b371-88ff6a22e998" /></a>


Hi, I'm Dex. I've been [hacking](https://youtu.be/8bIHcttkOTE) on [AI agents](https://theouterloop.substack.com) for [a while](https://humanlayer.dev). 


**I've tried every agent framework out there**, from the plug-and-play crew/langchains to the "minimalist" smolagents of the world to the "production grade" langraph, griptape, etc. 

**I've talked to a lot of really strong founders**, in and out of YC, who are all building really impressive things with AI. Most of them are rolling the stack themselves. I don't see a lot of frameworks in production customer-facing agents.

**I've been surprised to find** that most of the products out there billing themselves as "AI Agents" are not all that agentic. A lot of them are mostly deterministic code, with LLM steps sprinkled in at just the right points to make the experience truly magical.

Agents, at least the good ones, don't follow the ["here's your prompt, here's a bag of tools, loop until you hit the goal"](https://www.anthropic.com/engineering/building-effective-agents#agents) pattern. Rather, they are comprised of mostly just software. 

So, I set out to answer:

> ### **What are the principles we can use to build LLM-powered software that is actually good enough to put in the hands of production customers?**

Welcome to 12-factor agents. As every Chicago mayor since Daley has consistently plastered all over the city's major airports, we're glad you're here.

*Special thanks to [@iantbutler01](https://github.com/iantbutler01), [@tnm](https://github.com/tnm), [@hellovai](https://www.github.com/hellovai), [@stantonk](https://www.github.com/stantonk), [@balanceiskey](https://www.github.com/balanceiskey), [@AdjectiveAllison](https://www.github.com/AdjectiveAllison), [@pfbyjy](https://www.github.com/pfbyjy), [@a-churchill](https://www.github.com/a-churchill), and the SF MLOps 
```

#### 13. workshops/2025-05/sections/11-humanlayer-approval/README.md

```md
== 'request_more_information' %}
+{{ event.spec.msg }}
+{% else %}
+agent {{ event.run_id }} is requesting approval for {{event.spec.fn}}
+with args: {{event.spec.kwargs}}
+<br><br>
+reply to this email to approve
+{% endif %}`
             }
         }
```

<details>
<summary>skip this step</summary>

    cp ./walkthrough/11c-cli.ts src/cli.ts

</details>

first try with divide:


    npx tsx src/index.ts 'can you divide 4 by 5'

you should see a slightly different email with the custom template

![custom-template-email](https://github.com/humanlayer/12-factor-agents/blob/main/workshops/2025-05/walkthrough/11-email-custom.png?raw=true)

feel free to run with the flow and then you can try updating the template to your liking

(if you're using cursor, something as simple as highlighting the template and asking to "make it better"
should do the trick)

try triggering "request_more_information" as well!


thats it - in the next chapter, we'll build a fully email-driven 
workflow agent that uses webhooks for human approval 



```

#### 14. packages/walkthroughgen/examples/typescript/walkthrough/00-package-lock.json

```json
{
    "name": "walkthroughgen",
    "version": "1.0.0",
    "lockfileVersion": 3,
    "requires": true,
    "packages": {
      "": {
        "name": "walkthroughgen",
        "version": "1.0.0",
        "license": "ISC",
        "dependencies": {
          "typescript": "^5.8.3"
        }
      }
    },
    "node_modules/typescript": {
      "version": "5.8.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.8.3.tgz",
      "integrity": "sha512-p1diW6TqL9L07nNxvRMM7hMMw4c5XOo/1ibL4aAIGmSAt9slTE1Xgw5KWuof2uTOvCg9BY7ZRi+GaF+7sfgPeQ==",
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    }
  }
  
```

#### 15. packages/walkthroughgen/test/e2e/test-e2e.ts

```ts
       'console.log("hello");'
      );
      fs.writeFileSync(
        path.join(tempDir, 'walkthrough/v2-index.ts'),
        'console.log("hello");\nconsole.log("world");'
      );

      // Create walkthrough.yaml
      fs.writeFileSync(
        path.join(tempDir, 'walkthrough.yaml'),
        `title: "Test Section README Diffs"
text: "Testing section README diff generation"
targets:
  - folders:
      path: "./build/sections"
      final:
        dirName: "final"
    onChange:
      diff: true
      cp: true
    newFiles:
      cat: false
      cp: true
sections:
  - name: first-section
    title: "First Section"
    text: "First section text"
    steps:
      - text: "Add initial index.ts"
        file: {src: ./walkthrough/v1-index.ts, dest: src/index.ts}
  - name: second-section
    title: "Second Section"
    text: "Second section text"
    steps:
      - text: "Update index.ts"
        file: {src: ./walkthrough/v2-index.ts, dest: src/index.ts}`
      );

      // Run CLI
      cli(["generate", path.join(tempDir, "walkthrough.yaml")]);

      // Check first section README
      const firstSectionPath = path.join(tempDir, 'build/sections/00-first-section');
      const firstReadme = fs.readFileSync(path.join(firstSectionPath, 'README.md'), 'utf8');
      expect(firstReadme).toContain("Add initial index.ts");
      expect(firstReadme).toContain("cp ./walkthrough/v1-index.ts src/index.ts");
      expect(firstReadme).toContain("<details>\n<summary>show file</summary>");
      expect(firstReadme).toContain("```ts\n// ./walkthrough/v1-index.ts");
      expect(firstReadme).toContain('console.log("hello");');

      // Check second section README
      const secondSectionPath = path.join(tempDir, 'build/sections/01-second-section');
      const secondReadme = fs.readFileSync(path.join(secondSectionPath, 'README.md'), 'utf8');
  
```

#### 16. workshops/2025-05-17/sections/00-hello-world/README.md

```md
"allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "bundler",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "plugins": [],
      "paths": {
        "@/*": ["./*"]
      }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules", "walkthrough"]
  }
```

</details>

add .gitignore

    cp ./walkthrough/00-.gitignore .gitignore

<details>
<summary>show file</summary>

```gitignore
// ./walkthrough/00-.gitignore
baml_client/
node_modules/
```

</details>

Create src folder

    mkdir -p src

Add a simple hello world index.ts

    cp ./walkthrough/00-index.ts src/index.ts

<details>
<summary>show file</summary>

```ts
// ./walkthrough/00-index.ts
async function hello(): Promise<void> {
    console.log('hello, world!')
}

async function main() {
    await hello()
}

main().catch(console.error)
```

</details>

Run it to verify

    npx tsx src/index.ts

You should see:

    hello, world!


```

#### 17. workshops/2025-05/sections/00-hello-world/README.md

```md
"allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "bundler",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "incremental": true,
      "plugins": [],
      "paths": {
        "@/*": ["./*"]
      }
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    "exclude": ["node_modules", "walkthrough"]
  }
```

</details>

add .gitignore

    cp ./walkthrough/00-.gitignore .gitignore

<details>
<summary>show file</summary>

```gitignore
// ./walkthrough/00-.gitignore
baml_client/
node_modules/
```

</details>

Create src folder

    mkdir -p src

Add a simple hello world index.ts

    cp ./walkthrough/00-index.ts src/index.ts

<details>
<summary>show file</summary>

```ts
// ./walkthrough/00-index.ts
async function hello(): Promise<void> {
    console.log('hello, world!')
}

async function main() {
    await hello()
}

main().catch(console.error)
```

</details>

Run it to verify

    npx tsx src/index.ts

You should see:

    hello, world!


```

#### 18. packages/walkthroughgen/readme.md

```md
    # Used for folder naming and skip array
    title: "Initial Setup"   # Display title
    text: "Setup steps..."   # Section description
    steps:
      # ... steps ...
```

### Steps

Steps define the actions to take:

#### File Copy
```yaml
steps:
  - text: "Copy package.json"
    file:
      src: ./files/package.json
      dest: package.json
```

#### Directory Creation
```yaml
steps:
  - text: "Create src directory"
    dir:
      create: true
      path: src
```

#### Command Execution
```yaml
steps:
  - text: "Install dependencies"
    command: "npm install"
    incremental: true  # run when building up folders target
```

#### Command Results
```yaml
steps:
  - command: "npm run test"
    results:
      - text: "You should see:"
        code: |
          All tests passed!
```

## Generated Output

### Markdown Features

- **File Diffs**: Shows changes between versions
- **Copy Commands**: Easy-to-follow file copy instructions
- **Collapsible Sections**: Hide/show file contents
- **Code Highlighting**: Syntax highlighting for various languages

Example markdown output:

~~~markdown
# Initial Setup

Copy the package.json:

    cp ./files/package.json package.json

<details>
<summary>show file</summary>

```json
{
  "name": "my-project",
  "version": "1.0.0"
}
```
</details>

Install dependencies:

    npm install

You should see:

    added 123 packages
~~~

### Section Folders

The `folders` target creates:

1. A directory for each section
2. Section-specific README.md files
3. Working project state
4. Optional final state directory

## Examples

See the [examples](./examples) directory for complete examples:

- [TypeScript CLI](./examples/typescript): Basic TypeScript project setup
- [Walkthroughgen](./examples/walkthroughgen): Self-documenting example

## Tips

1. Use meaningful section names - they become folder names
2. Include context in step text
3. Use `incremental: true` for commands that modify state
4. Leverage diffs to highlight important changes
5. Use the `skip` array to exclude setup/cleanup sections from output

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

```

#### 19. content/factor-03-own-your-context-window.md

```md
 {
    "role": "user",
    "content": |
            Here's everything that happened so far:
        
        <slack_message>
            From: @alex
            Channel: #deployments
            Text: Can you deploy the backend?
        </slack_message>
        
        <list_git_tags>
            intent: "list_git_tags"
        </list_git_tags>
        
        <list_git_tags_result>
            tags:
              - name: "v1.2.3"
                commit: "abc123"
                date: "2024-03-15T10:00:00Z"
              - name: "v1.2.2"
                commit: "def456"
                date: "2024-03-14T15:30:00Z"
              - name: "v1.2.1"
                commit: "ghi789"
                date: "2024-03-13T09:15:00Z"
        </list_git_tags_result>
        
        what's the next step?
    }
]
```

The model may infer that you're asking it `what's 
```

#### 20. packages/walkthroughgen/examples/typescript/walkthrough/00-package.json

```json
{
    "name": "walkthroughgen",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "description": "",
    "dependencies": {
      "typescript": "^5.8.3"
    }
  }
  
```

