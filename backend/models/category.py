from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Integer, String, DateTime
from datetime import datetime
from models.base import Base
from typing import List

class Category(Base):
  __tablename__ = 'categories'
  id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
  name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
  photo_url: Mapped[str] = mapped_column(String(80000), nullable=True)
  created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
  parent_id: Mapped[int] = mapped_column(Integer, ForeignKey('categories.id'), nullable=True)
  parent: Mapped['Category'] = relationship('Category', remote_side=[id], back_populates='children', cascade='', lazy='select')
  children: Mapped[List['Category']] = relationship('Category', back_populates='parent', lazy='joined')