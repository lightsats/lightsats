-- This is an empty migration.

UPDATE "Tip" SET "status" = 'SEEN' WHERE "status" = 'UNCLAIMED' AND "claimLinkViewed" = true;
UPDATE "Tip" SET "status" = 'UNSEEN' WHERE "status" = 'UNCLAIMED';