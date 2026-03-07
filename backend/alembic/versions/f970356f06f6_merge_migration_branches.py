"""merge migration branches

Revision ID: f970356f06f6
Revises: dc4631938b3d, e5f6g7h8i9j0
Create Date: 2026-03-07 22:03:40.826848

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f970356f06f6'
down_revision: Union[str, Sequence[str], None] = ('dc4631938b3d', 'e5f6g7h8i9j0')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
