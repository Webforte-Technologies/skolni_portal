import { RequestWithUser } from '../../middleware/auth';
import { CreditTransactionModel } from '../../models/CreditTransaction';
import { UserModel } from '../../models/User';

/**
 * Credit requirements for different material types
 */
export const CREDIT_REQUIREMENTS = {
  worksheet: 5,
  'lesson-plan': 8,
  quiz: 6,
  project: 10,
  presentation: 7,
  activity: 6,
  batch: 15,
  chat: 1
} as const;

export type MaterialType = keyof typeof CREDIT_REQUIREMENTS;

/**
 * Check if user has sufficient credits for generation
 */
export async function checkUserCredits(userId: string, materialType: MaterialType): Promise<{
  hasCredits: boolean;
  required: number;
  current: number;
  user?: any;
}> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const required = CREDIT_REQUIREMENTS[materialType];
  const hasCredits = user.credits_balance >= required;

  return {
    hasCredits,
    required,
    current: user.credits_balance,
    user
  };
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  userId: string, 
  materialType: MaterialType, 
  balanceBefore: number,
  description?: string
): Promise<void> {
  const required = CREDIT_REQUIREMENTS[materialType];
  const balanceAfter = balanceBefore - required;

  await CreditTransactionModel.create({
    user_id: userId,
    transaction_type: 'usage',
    amount: -required,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    description: description || `${materialType} generation`
  });

  // Update user balance
  await UserModel.updateCredits(userId, balanceAfter);
}

/**
 * Get updated user balance after transaction
 */
export async function getUpdatedUserBalance(userId: string): Promise<number> {
  const user = await UserModel.findById(userId);
  return user?.credits_balance || 0;
}

/**
 * Validate credit requirements and deduct credits
 */
export async function validateAndDeductCredits(
  req: RequestWithUser,
  materialType: MaterialType,
  description?: string
): Promise<{
  success: boolean;
  error?: string;
  creditsUsed?: number;
  newBalance?: number;
}> {
  try {
    const creditCheck = await checkUserCredits(req.user!.id, materialType);
    
    if (!creditCheck.hasCredits) {
      return {
        success: false,
        error: `Nedostatek kreditů. Potřebujete ${creditCheck.required} kreditů, máte ${creditCheck.current}.`
      };
    }

    await deductCredits(req.user!.id, materialType, creditCheck.current, description);
    const newBalance = await getUpdatedUserBalance(req.user!.id);

    return {
      success: true,
      creditsUsed: creditCheck.required,
      newBalance
    };
  } catch (error) {
    console.error('Credit validation error:', error);
    return {
      success: false,
      error: 'Chyba při zpracování kreditů'
    };
  }
}
