using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ProjectManagement.API.Models;

namespace ProjectManagement.API.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;
        public TokenService(IConfiguration config)
        {
            _config=config;
        }
        public string CreateToken(User user){
            var claims = new List<Claim>
            {
                new Claim (ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim (ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };
            var key=new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]!));

            var creds=new SigningCredentials(key, SecurityAlgorithms.HmacSha256);    
            
            var token=new JwtSecurityToken(
                issuer:_config["JwtSettings:Issuer"],
                audience:_config["JwtSettings:Audience"],
                claims:claims,
                expires:DateTime.UtcNow.AddMinutes(
                    double.Parse(_config["JwtSettings:ExpiryMinutes"]!)),
                    signingCredentials: creds
                );
                return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
