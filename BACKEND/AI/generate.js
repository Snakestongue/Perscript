import OpenAI from "openai";
export let createAdvice =async(req, res)=> {
    const {content, language, problem, correctAnswer} = req.body;
    const githubAI = new OpenAI({
        apiKey: process.env.GROQ_TOKEN, 
        baseURL: "https://api.groq.com/openai/v1" 
    });
    const models = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "llama-3.3-70b-versatile"
    ];
    for (let modelId of models){
        try{
            const response = await githubAI.chat.completions.create({
                    model:modelId,
                    messages: [
                        {role: "system", content: "You are a strict but helpful FRC programming tutor for middle and high school students"},
                        {role: "user", content: `
                            A student requires help with knowing what's wrong with their code. 
                            They are trying to solve ${problem} in ${language} and their current code is ${content}. 
                            Guide the student to get to the correct answer which is ${correctAnswer}
                            Rules:
                            - Keep explanations short and simple.
                            - Do NOT introduce advanced concepts unless required by the problem.
                            - Do NOT add optional "good practices" unless asked.
                            - Focus only on helping the student reach the correct answer.
                            - Prefer hints over long explanations.
                            - If code is almost correct, clearly point out ONLY what needs to change.
                            - If the code is correct completely, say "The code is correct!"
                        ` }
                    ]
                }
            );
            return res.json({result:response.choices[0].message.content})
        }catch (error){
            console.log(`Model ${modelId} failutres:`, error.message);
        }
    }
    res.status(500).json({message: "No models worked"});
};