from models import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Integer, String, DateTime, Boolean, TIMESTAMP
from datetime import datetime

class AbstractObjective:
  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  title: Mapped[str] = mapped_column(String(100), nullable=False)
  description: Mapped[str] = mapped_column(String(1000), nullable=True)
  created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
  is_completed: Mapped[Boolean] = mapped_column(Boolean, default=False)