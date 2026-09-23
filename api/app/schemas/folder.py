from pydantic import BaseModel, ConfigDict, Field


class FolderSave(BaseModel):
    """Creating a folder, or renaming one. A name is all a folder has."""

    name: str = Field(min_length=1, max_length=100)


class FolderResponse(BaseModel):
    """A folder plus how much is in it.

    qrCount is carried here rather than fetched per folder by the client: the
    grid shows the count on every tile, so leaving it out would turn one
    request into one per folder.
    """

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    name: str
    qr_count: int = Field(default=0, serialization_alias="qrCount")


class FolderAssignment(BaseModel):
    """Move one code into a folder, or out of every folder.

    folder_id None is "unfiled" rather than a missing value, so the same
    endpoint answers both "move it here" and "take it out", and the client
    never has to choose between two calls.
    """

    qr_id: int = Field(validation_alias="qrId")
    folder_id: int | None = Field(default=None, validation_alias="folderId")

    model_config = ConfigDict(populate_by_name=True)
