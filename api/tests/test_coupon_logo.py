"""A coupon's brand logo threads through the schema layer.

The logo is an optional image data URL. It has to be accepted on the way in,
serialized on the way out, and absent for a coupon that predates the field.
"""

from app.schemas.coupon import CouponContentCreate, CouponContentResponse


def test_create_accepts_a_logo():
    c = CouponContentCreate(title="20% off", code="SAVE20", logo="data:image/webp;base64,AAAA")
    assert c.logo == "data:image/webp;base64,AAAA"


def test_logo_is_optional_on_the_way_in():
    c = CouponContentCreate(title="20% off", code="SAVE20")
    assert c.logo is None


def test_response_carries_the_logo():
    out = CouponContentResponse(
        id=1, qr_id=2, title="20% off", code="SAVE20",
        expiry=None, description=None, url=None, logo="data:image/webp;base64,BBBB",
    ).model_dump()
    assert out["logo"] == "data:image/webp;base64,BBBB"


def test_response_logo_defaults_to_none_for_an_older_coupon():
    out = CouponContentResponse(
        id=1, qr_id=2, title="20% off", code="SAVE20",
        expiry=None, description=None, url=None,
    ).model_dump()
    assert out["logo"] is None
