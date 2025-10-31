using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace task_manager_api.Migrations
{
    /// <inheritdoc />
    public partial class FixStaticSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$AJcog84r2bDESTqn7iI.5eGLKz8/V.8rePpO/E0FMpnROLR5KyTOm");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "PasswordHash",
                value: "$2a$11$BMyhxw8kJXMWxp7YdageUOQBXPsk5I3BfOEoHo7OrGcGLS9fQPOmy");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "PasswordHash",
                value: "$2a$11$WBWqeQ.RX2e0SJf0KJFU0eHPU0YbTvhYD8NYX8QR8gVhwFONuo3nW");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "PasswordHash",
                value: "$2a$11$jZrRWH7iz4ZlZE9T03hTwuv7eYUQwVzyJnYkQJleGYhe6C.CPY37C");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "PasswordHash",
                value: "$2a$11$MYR9oOUxQO.rXRBhgMdiW.cJ4ECVrZyKK/NX8F6Xf.waOKgXwa5bO");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "PasswordHash",
                value: "$2a$11$fj52817o25WtfmM7P2Lj8O5g6foEFdFgqqzjDRvlb75PvOzovQShe");
        }
    }
}
