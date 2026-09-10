"""The link-tree icon field threads through the schema layer.

A link's icon is a small key the frontend draws from a fixed set. It has to
survive both directions: accepted on the way in, serialized (camelCase intact
around it) on the way out, and defaulting to nothing when absent — an old link
predates the field.
"""

from app.schemas.link_tree import LinkTreeLinkCreate, LinkTreeLinkResponse


def test_create_accepts_an_icon():
    link = LinkTreeLinkCreate(label="Instagram", url="https://ig.com/x", icon="instagram")
    assert link.icon == "instagram"


def test_icon_is_optional_on_the_way_in():
    link = LinkTreeLinkCreate(label="Site", url="https://example.com")
    assert link.icon is None


def test_response_serializes_icon_alongside_the_camelcase_alias():
    out = LinkTreeLinkResponse(
        id=1, link_tree_id=2, label="X", url="https://x.com", icon="x", display_order=1
    ).model_dump(by_alias=True)
    assert out["icon"] == "x"
    assert out["displayOrder"] == 1  # the field's existing alias still holds


def test_response_icon_defaults_to_none_for_a_link_that_predates_the_field():
    out = LinkTreeLinkResponse(
        id=1, link_tree_id=2, label="Old", url="https://old.com", display_order=1
    ).model_dump(by_alias=True)
    assert out["icon"] is None
