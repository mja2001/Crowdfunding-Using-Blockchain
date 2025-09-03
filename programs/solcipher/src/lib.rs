use anchor_lang::prelude::*;

declare_id!("SoLCipheR111111111111111111111111111111111");

#[program]
mod solcipher {
    use super::*;

    pub fn share_file(
        ctx: Context<ShareFile>,
        recipient: Pubkey,
        encrypted_key: Vec<u8>,
        cid: String,
        iv: [u8;12]
    ) -> Result<()> {
        require!(encrypted_key.len() <= 80, SolcipherError::EncryptedKeyTooLong);
        require!(cid.len() <= 64, SolcipherError::CidTooLong);

        let file = &mut ctx.accounts.file;
        file.sender = *ctx.accounts.sender.key;
        file.recipient = recipient;
        file.encrypted_key = encrypted_key;
        file.cid = cid;
        file.iv = iv;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct ShareFile<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(
        init,
        payer = sender,
        space = 8 + FileMetadata::LEN
    )]
    pub file: Account<'info, FileMetadata>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct FileMetadata {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub encrypted_key: Vec<u8>,
    pub cid: String,
    pub iv: [u8;12],
}

impl FileMetadata {
    pub const LEN: usize = 32 + 32 + 4 + 80 + 4 + 64 + 12;
}

#[error_code]
pub enum SolcipherError {
    #[msg("Encrypted key too long")]
    EncryptedKeyTooLong,
    #[msg("CID too long")]
    CidTooLong,
}
