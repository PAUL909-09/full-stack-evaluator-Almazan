using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace task_manager_api.Migrations
{
    /// <inheritdoc />
    public partial class AddSubmissionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAssignments_Users_UserId",
                table: "ProjectAssignments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProjectAssignments",
                table: "ProjectAssignments");

            migrationBuilder.AddColumn<string>(
                name: "ProofFilePath",
                table: "Tasks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedAt",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProjectAssignments",
                table: "ProjectAssignments",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectAssignments_ProjectId",
                table: "ProjectAssignments",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAssignments_Users_UserId",
                table: "ProjectAssignments",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectAssignments_Users_UserId",
                table: "ProjectAssignments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProjectAssignments",
                table: "ProjectAssignments");

            migrationBuilder.DropIndex(
                name: "IX_ProjectAssignments_ProjectId",
                table: "ProjectAssignments");

            migrationBuilder.DropColumn(
                name: "ProofFilePath",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                table: "Tasks");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProjectAssignments",
                table: "ProjectAssignments",
                columns: new[] { "ProjectId", "UserId" });

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectAssignments_Users_UserId",
                table: "ProjectAssignments",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
