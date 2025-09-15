'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      length: 10,
      allowNull: false,
      defaultValue: 'active',
    });

    await queryInterface.renameColumn('users', 'createdAt', 'created_at');
    await queryInterface.renameColumn('users', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('users', 'companyId', 'company_id');
    await queryInterface.renameColumn('companies', 'createdAt', 'created_at');
    await queryInterface.renameColumn('companies', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('tickets', 'createdAt', 'created_at');
    await queryInterface.renameColumn('tickets', 'updatedAt', 'updated_at');
    await queryInterface.renameColumn('tickets', 'companyId', 'company_id');
    await queryInterface.renameColumn('tickets', 'assigneeId', 'assignee_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'status');
    await queryInterface.renameColumn('users', 'created_at', 'createdAt');
    await queryInterface.renameColumn('users', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('users', 'company_id', 'companyId');
    await queryInterface.renameColumn('companies', 'created_at', 'createdAt');
    await queryInterface.renameColumn('companies', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('tickets', 'created_at', 'createdAt');
    await queryInterface.renameColumn('tickets', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('tickets', 'company_id', 'companyId');
    await queryInterface.renameColumn('tickets', 'assignee_id', 'assigneeId');
  },
};
