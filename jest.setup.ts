import "@testing-library/jest-dom";

// Add any global setup needed for your tests here
// For example, if you need to mock the next/router
jest.mock("next/router", () => ({
	useRouter: jest.fn(() => ({
		pathname: "/",
		push: jest.fn(),
		replace: jest.fn(),
	})),
}));

// Reset all mocks automatically between tests
beforeEach(() => {
	jest.clearAllMocks();
});
