-- The starter seed has no organization and must not block the first secure workspace settings record.
delete from settings where organization_id is null;
