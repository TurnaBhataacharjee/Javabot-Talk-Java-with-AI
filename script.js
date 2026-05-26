let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://api.groq.com/openai/v1/chat/completions";
const Api_Key = "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"; // 🔑 Replace with your Groq API key

let user = {
  message: null,
  file: {
    mime_type: null,
    data: null
  }
};

async function generateResponse(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area");

  if ((!user.message || user.message.trim() === "") && !user.file.data) {
    return;
  }

  if (!user.message || user.message.trim() === "") {
    user.message = "Describe this image in detail.";
  }

  const javaOnlyPrompt = `You are an expert assistant who answers only Java programming questions. 
Use your knowledge to understand whether a question is about Java, even if it doesn't mention "Java" directly. 
If the question is related to Java (programming, syntax, libraries, tools, or concepts), answer it helpfully. 
If the question is not related to Java, reply: "Sorry, I can only answer questions related to Java programming."

Question: ${user.message}`;

  let RequestOption = {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Api_Key}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: javaOnlyPrompt }
      ]
    })
  };

  try {
    let response = await fetch(Api_Url, RequestOption);
    let data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "API request failed");
    }

    let apiResponse = data.choices[0].message.content.replace(/\*\*(.*?)\*\*/g, "$1").trim();

    text.innerHTML = `
      <pre style="white-space: pre-wrap; font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif; line-height: 1.8; background: transparent; border: none;">
        ${apiResponse}
      </pre>
    `;
  } catch (error) {
    console.log(error);
    text.innerHTML = `⚠️ Error: ${error.message}. Please try again.`;
  } finally {
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    image.src = `img.svg`;
    image.classList.remove("choose");
    user.file = {};
  }
}

function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

function handlechatResponse(userMessage) {
  user.message = userMessage;
  if ((!user.message || user.message.trim() === "") && !user.file.data) {
    return;
  }

  let html = `<img src="images/user.png" alt="" id="userImage" width="8%" />
      <div class="user-chat-area">
        ${user.message}
        ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
      </div>`;
  prompt.value = "";

  let userChatBox = createChatBox(html, "user-chat-box");
  chatContainer.appendChild(userChatBox);
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    let html = `<img src="images/ai.png" alt="" id="aiImage" width="10%" />
      <div class="ai-chat-area">
        <img src="loading.gif" alt="" class="load" width="50">
      </div>`;
    let aiChatBox = createChatBox(html, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);
    generateResponse(aiChatBox);
  }, 600);
}

prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handlechatResponse(prompt.value);
  }
});

submitbtn.addEventListener("click", () => {
  handlechatResponse(prompt.value);
});

imagebtn.addEventListener("change", () => {
  const file = imageinput.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = (e) => {
    let base64string = e.target.result.split(",")[1];
    user.file = {
      mime_type: file.type,
      data: base64string
    };
    image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
    image.classList.add("choose");
  };
  reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
  imagebtn.querySelector("input").click();
});
