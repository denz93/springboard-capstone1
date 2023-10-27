from models.abtract_objective import AbstractObjective
from models import Category, User, Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.sqltypes import Boolean, TIMESTAMP, Integer, String
from datetime import datetime
from typing import List, TYPE_CHECKING
if TYPE_CHECKING:
  from models.task import Task

class Goal(AbstractObjective, Base):
  __tablename__ = 'goals'
  soft_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
  updated_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
  start_date: Mapped[datetime] = mapped_column(TIMESTAMP)
  end_date: Mapped[datetime] = mapped_column(TIMESTAMP)
  category_id: Mapped[int] = mapped_column(Integer, ForeignKey('categories.id'), nullable=True)
  category: Mapped[Category] = relationship(Category)

  user_id: Mapped[str] = mapped_column(String, ForeignKey('users.id'))
  user: Mapped[User] = relationship(User, back_populates='goals')
  tasks: Mapped[List['Task']] = relationship('Task', back_populates='goal', cascade='all, delete-orphan')
  def check_if_all_tasks_completed(self):
    return len(list(filter(lambda t: t.is_completed, self.tasks))) == len(self.tasks)