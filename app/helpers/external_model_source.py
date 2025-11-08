from enum import Enum
import os
from typing import Optional
import openai
import anthropic
import os
from dotenv import load_dotenv


class SupportedModels(Enum):
    CLAUDE_SONNET_4 = "claude-sonnet-4-5"
    CHATGPT_4 = "gpt-4-turbo-preview"
    CHATGPT_5 = "gpt-5"

class ExternalModel:
    def __init__(self, prompt: str, model_name: SupportedModels):
        self.prompt = prompt
        self.model_name = model_name
        load_dotenv()
        self.openAIKey = os.getenv("OPENAI_API_KEY")
        self.anthropicKey = os.getenv("ANTHROPIC_API_KEY")
        self.system_prompt = os.getenv("SYSTEM_PROMPT")
        self.user_prefix = os.getenv("USER_PREFIX")


    def generate(self) -> str:
        """Generate response using the specified external model."""
        if self.model_name == SupportedModels.CLAUDE_SONNET_4:
            return self._call_anthropic_api(self.prompt)
        elif self.model_name == SupportedModels.CHATGPT_4 or self.model_name == SupportedModels.CHATGPT_5:
            return self._call_openai_api(self.prompt)
        else:
            raise ValueError(f"Unsupported model: {self.model_name}")

    def _call_anthropic_api(self, prompt: str) -> str:
        """Call Anthropic Claude API."""
        try:
            client = anthropic.Anthropic(api_key=self.anthropicKey)
            
            message = client.messages.create(
                model=self.model_name.value,
                max_tokens=1000,
                temperature=0.7,
                system=self.system_prompt,
                messages=[
                    {"role": "user", "content": self.user_prefix + prompt}
                ]
            )
            
            return message.content[0].text
        except Exception as e:
            raise Exception(f"Error calling Anthropic API: {str(e)}")

    def _call_openai_api(self, prompt: str) -> str:
        """Call OpenAI GPT API."""
        try:
            client = openai.OpenAI(api_key=self.openAIKey)
            
            response = client.chat.completions.create(
                model=self.model_name.value,
                instruction=self.system_prompt,
                messages=[
                    {"role": "user", "content": self.user_prefix + prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error calling OpenAI API: {str(e)}")