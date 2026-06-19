from __future__ import annotations

from sqlalchemy.orm import Session

from models import NumberingConfiguration


class NumberGeneratorService:
    """Service for generating and managing sequential numbers for CRM entities."""

    @staticmethod
    def generate(db: Session, entity_name: str) -> str:
        """
        Generate the next number for a given entity.

        Args:
            db: Database session
            entity_name: Name of the entity (e.g., "CONTACT", "INVOICE")

        Returns:
            Formatted number string (e.g., "CNT-0298", "INV-1001")

        Raises:
            ValueError: If entity configuration not found or inactive
        """
        config = (
            db.query(NumberingConfiguration)
            .filter(
                NumberingConfiguration.entity_name == entity_name,
                NumberingConfiguration.is_active == True,
            )
            .with_for_update()
            .first()
        )

        if not config:
            raise ValueError(
                f"No active numbering configuration found for entity: {entity_name}"
            )

        # Increment current number
        config.current_number += 1
        db.commit()

        # Format the number with zero padding (4 digits)
        number_str = str(config.current_number).zfill(4)

        # Build the formatted number: PREFIX-0000[-SUFFIX]
        parts = [config.prefix, number_str]
        if config.suffix:
            parts.append(config.suffix)

        return "-".join(parts)

    @staticmethod
    def get_next_number(db: Session, entity_name: str) -> str:
        """
        Preview the next number without incrementing.

        Args:
            db: Database session
            entity_name: Name of the entity

        Returns:
            Formatted number string preview
        """
        config = (
            db.query(NumberingConfiguration)
            .filter(
                NumberingConfiguration.entity_name == entity_name,
                NumberingConfiguration.is_active == True,
            )
            .first()
        )

        if not config:
            raise ValueError(
                f"No active numbering configuration found for entity: {entity_name}"
            )

        next_number = config.current_number + 1
        number_str = str(next_number).zfill(4)

        parts = [config.prefix, number_str]
        if config.suffix:
            parts.append(config.suffix)

        return "-".join(parts)

    @staticmethod
    def reset_counter(db: Session, entity_name: str, new_value: int) -> None:
        """
        Reset the current number counter for an entity.

        Args:
            db: Database session
            entity_name: Name of the entity
            new_value: New counter value
        """
        config = (
            db.query(NumberingConfiguration)
            .filter(NumberingConfiguration.entity_name == entity_name)
            .first()
        )

        if not config:
            raise ValueError(f"No numbering configuration found for entity: {entity_name}")

        config.current_number = new_value
        db.commit()
