export const emailAdapterMock = {
  sendEmailConfirmationMessage: jest.fn().mockResolvedValue(true),
  sendEmailPasswordRecovery: jest.fn().mockResolvedValue(true),
};
