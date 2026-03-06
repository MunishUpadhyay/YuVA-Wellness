"""Add Google Auth fields to User

Revision ID: e5f6g7h8i9j0
Revises: dcad5ab6544d
Create Date: 2026-03-07 04:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e5f6g7h8i9j0'
down_revision: Union[str, Sequence[str], None] = 'dcad5ab6544d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add provider column with default 'local'
    op.add_column('users', sa.Column('provider', sa.String(length=50), nullable=False, server_default='local', comment='Authentication provider: local or google'))
    # Add profile_picture column
    op.add_column('users', sa.Column('profile_picture', sa.String(length=500), nullable=True, comment='Profile picture URL from social provider'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'profile_picture')
    op.drop_column('users', 'provider')
