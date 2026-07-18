"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("match_frames", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      match_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "matches", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      frame_number: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      },
      home_player_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "players", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      away_player_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "players", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      winner_player_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "players", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      winner_side: {
        type: Sequelize.ENUM("HOME", "AWAY", "NONE"),
        allowNull: false,
        defaultValue: "NONE"
      },
      result_type: {
        type: Sequelize.ENUM("NORMAL", "WALKOVER", "FORFEIT", "VOID"),
        allowNull: false,
        defaultValue: "NORMAL"
      },
      home_frame_points: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0
      },
      away_frame_points: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0
      },
      notes: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex("match_frames", ["match_id", "frame_number"], {
      unique: true,
      name: "match_frames_match_number_unique"
    });
    await queryInterface.addIndex("match_frames", ["home_player_id"]);
    await queryInterface.addIndex("match_frames", ["away_player_id"]);
    await queryInterface.addIndex("match_frames", ["winner_player_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("match_frames");
  }
};
