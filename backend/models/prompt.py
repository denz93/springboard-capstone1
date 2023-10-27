from models import Base, Category
from sqlalchemy import ForeignKey
from sqlalchemy.types import Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
import json 

class Prompt(Base):
  __tablename__ = 'prompts'
  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  messages_str: Mapped[str] = mapped_column(String, nullable=False, index=True, unique=True)
  response: Mapped[str] = mapped_column(String, nullable=True)
  created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

  @property
  def messages(self) -> list[dict]:
    return json.loads(self.messages_str)
  
  @messages.setter
  def messages(self, messages: list[dict]):
    self.messages_str = json.dumps(messages, indent=None, separators=(',', ':'))

