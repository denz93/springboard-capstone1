from models.abtract_objective import AbstractObjective
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Integer

from models.goal import Goal, Base

class Task(AbstractObjective, Base):
  __tablename__ = 'tasks'
  goal_id: Mapped[int] = mapped_column(Integer, ForeignKey('goals.id'))
  goal: Mapped[Goal] = relationship(Goal, back_populates='tasks')
