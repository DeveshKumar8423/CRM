from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True)
    code = Column(String(80), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    module = Column(String(50), nullable=False)


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(Integer, primary_key=True)
    role = Column(String(30), nullable=False, index=True)
    permission_id = Column(Integer, ForeignKey("permissions.id"), nullable=False)


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    legal_name = Column(String(200), nullable=False)
    display_name = Column(String(200), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(30), nullable=True)
    website = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    country = Column(String(100), nullable=False, default="India")
    gstin = Column(String(15), nullable=True)
    pan = Column(String(10), nullable=True)
    currency = Column(String(3), nullable=False, default="INR")
    financial_year_start_month = Column(Integer, nullable=False, default=4)
    timezone = Column(String(50), nullable=False, default="Asia/Kolkata")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    users = relationship("User", back_populates="company")
    contacts = relationship("Contact", back_populates="company")
    products = relationship("Product", back_populates="company")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    service_code = Column(String(40), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    entity_type = Column(String(80), nullable=True)
    category = Column(String(120), nullable=True)
    sub_category = Column(String(120), nullable=True)
    unit = Column(String(30), nullable=False, default="Service")
    govt_charges = Column(Numeric(12, 2), nullable=True)
    our_fees = Column(Numeric(12, 2), nullable=True)
    gst_amount = Column(Numeric(12, 2), nullable=True)
    total_price = Column(Numeric(12, 2), nullable=True)
    market_price = Column(Numeric(12, 2), nullable=True)
    offer_price = Column(Numeric(12, 2), nullable=True)
    last_price = Column(Numeric(12, 2), nullable=True)
    gst_rate = Column(Numeric(5, 2), nullable=False, default=18)
    filing_timeline = Column(String(80), nullable=True)
    completion_timeline = Column(String(80), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    company = relationship("Company", back_populates="products")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    name = Column(String(120), nullable=False)
    organization_name = Column(String(200), nullable=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(30), nullable=True)
    alt_phone = Column(String(30), nullable=True)
    contact_type = Column(String(30), nullable=False)
    status = Column(String(20), nullable=False, default="active")
    designation = Column(String(120), nullable=True)
    website = Column(String(255), nullable=True)
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    country = Column(String(100), nullable=False, default="India")
    gstin = Column(String(15), nullable=True)
    pan = Column(String(10), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    company = relationship("Company", back_populates="contacts")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    portal_user = relationship("User", foreign_keys=[user_id])
    notes = relationship("ContactNote", back_populates="contact")
    activities = relationship("ContactActivity", back_populates="contact")


class ContactNote(Base):
    __tablename__ = "contact_notes"

    id = Column(Integer, primary_key=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contact = relationship("Contact", back_populates="notes")
    author = relationship("User")


class ContactActivity(Base):
    __tablename__ = "contact_activities"

    id = Column(Integer, primary_key=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_type = Column(String(20), nullable=False)
    subject = Column(String(200), nullable=True)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contact = relationship("Contact", back_populates="activities")
    author = relationship("User")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    employee_id = Column(String(20), unique=True, nullable=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(30), nullable=True)
    password = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False)
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), nullable=False, default="active")
    designation = Column(String(120), nullable=True)
    department = Column(String(120), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    company = relationship("Company", back_populates="users")
    activities = relationship("ActivityLog", back_populates="user")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    email = Column(String(255), nullable=True)
    action = Column(String(50), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activities")
