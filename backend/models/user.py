from datetime import datetime
from sqlalchemy.orm import relationship, DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.types import Integer, String, DateTime
from models.base import Base
from typing import List, TYPE_CHECKING

# Avoid circular import error due to relationship User <-> Goal
if TYPE_CHECKING:
  from models.goal import Goal

class User(Base):
  """
    User model

    We use `firebase_uid` for `id` column
  """
  __tablename__ = 'users'
  id: Mapped[str] = mapped_column(String(36), primary_key=True)
  email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
  first_name: Mapped[str] = mapped_column(String(100), nullable=False)
  last_name: Mapped[str] = mapped_column(String(100), nullable=False)
  created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
  goals: Mapped[List['Goal']] = relationship('Goal', back_populates='user', cascade='all, delete-orphan', lazy='select')
  role: Mapped[str] = mapped_column(String(100), default='user')
  photo_url: Mapped[str] = mapped_column(String(80000), nullable=True)