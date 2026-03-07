"""add recovery_code_shown column

Revision ID: 17b11d397340
Revises: f970356f06f6
Create Date: 2026-03-07 22:04:09.070016

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '17b11d397340'
down_revision: Union[str, Sequence[str], None] = 'f970356f06f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('recovery_code_shown', sa.Boolean(), nullable=False, server_default='false', comment='Whether the user has seen their recovery code'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'recovery_code_shown')
