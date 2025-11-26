'use strict';

const { onMatchFinalized } = require('./onMatchFinalized');
const { onRecalcQueueUpdate, onRecalcQueueTouch, cronRecalcDrain } = require('./recalcScheduler');
const { onAdminCommand } = require('./adminCommands');
const participants = require('./participantsTriggers');
const seeding = require('./seedingTriggers');
const settings = require('./settingsTriggers');

exports.onMatchFinalized = onMatchFinalized;
exports.onRecalcQueueUpdate = onRecalcQueueUpdate;
exports.onRecalcQueueTouch = onRecalcQueueTouch;
exports.cronRecalcDrain = cronRecalcDrain;
exports.onAdminCommand = onAdminCommand;

// Participant-related
exports.onParticipantAdded = participants.onParticipantAdded;
exports.onParticipantRemoved = participants.onParticipantRemoved;
exports.onParticipantUpdated = participants.onParticipantUpdated;

// Seeding docs
exports.onSeedingWrite = seeding.onSeedingWrite;

// Settings
exports.onTournamentUpdated = settings.onTournamentUpdated;
exports.onSettingsDocWrite = settings.onSettingsDocWrite;

// Email verification
const { onUserCreated } = require('./emailVerification');
const { verifyEmail } = require('./emailVerification');

exports.onUserCreated = onUserCreated;
exports.verifyEmail = verifyEmail;
