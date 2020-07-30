import CartParser from './CartParser';

let parser, validate, parseLine, parse;

beforeEach(() => {
	parser = new CartParser();
	validate = parser.validate.bind(parser);
	parseLine = parser.parseLine.bind(parser);
	parse = parser.parse.bind(parser);
});



describe('CartParser - unit tests', () => {
	it('should return object when data is correct', () => {
		parser.readFile = jest.fn(() => `Product name, Price, Quantity
		Example product, 1, 3`);
		const expectedResult = { items: [{ id: expect.anything(), name: 'Example product', price: 1, quantity: 3 }], total: 3 };

		const result = parse();

		expect(result).toEqual(expectedResult);
	});

	it('should throw error when there are validation errors', () => {
		parser.readFile = jest.fn(() => `Product name, Price, Quantity
		Example product, 9466, kgdsrgjsrj`);
		console.error = jest.fn();
		
		const result = () => { parse() };

		expect(result).toThrow('Validation failed!');
	});

	it('should return a string when the column type is "string"', () => {
		const testData = '62634, 89974.00, 356345';
		
		const { name } = parseLine(testData);

		expect(name).toBe('62634');
	});

	it('should return a number when the column type is "numberPositive"', () => {
		const testData = 'Example product1, 89974.00, 356345';

		const { quantity, price } = parseLine(testData);

		expect(quantity).toBe(356345);
		expect(price).toBe(89974.00);
	});

	it('should return an array with all errors if data is not vaild', () => {
		const testData = `Product name, Price, Amount
		Exapmle product0, 4536, -4153465,
		Example product1, 89974.00, null`;
		const error1 = parser.createError('header', 0,  2, 'Expected header to be named "Quantity" but received Amount.');
		const error2 = parser.createError('cell', 1, 2, `Expected cell to be a positive number but received "-4153465".`);;
		const error3 = parser.createError('cell', 2, 2, `Expected cell to be a positive number but received "null".`);

		expect(validate(testData)).toEqual([error1, error2, error3]);
	});

	it('should return an array with cell type error when the cell is a not positive number', () => {
		const testData1 = `Product name, Price, Quantity
		Example product1, 89974.00, -356345`;
		const testData2 = `Product name, Price, Quantity
		Example product1, 89974.00, abcdefg`;
		const testData3 = `Product name, Price, Quantity
		Example product1, 89974.00, true`;
		const testData4 = `Product name, Price, Quantity
		Example product1, 89974.00, null`;
		const testData5 = `Product name, Price, Quantity
		Example product1, 89974.00, undefined`;
		const testData6 = `Product name, Price, Quantity
		Example product1, 89974.00, {}`;
		const testData7 = `Product name, Price, Quantity
		Example product1, 89974.00, []`;
		const testData8 = `Product name, Price, Quantity
		Example product1, 89974.00, NaN`;
		const error1 = parser.createError('cell', 1, 2, `Expected cell to be a positive number but received "-356345".`);
		const error2 = parser.createError('cell', 1, 2, `Expected cell to be a positive number but received "abcdefg".`);
		const error3 = parser.createError('cell', 1, 2, `Expected cell to be a positive number but received "true".`);
		const error4 = parser.createError('cell', 1, 2, `Expected cell to be a positive number but received "null".`);
		const error5 = parser.createError('cell', 1, 2, `Expected cell to be a positive number but received "undefined".`);
		const error6 = parser.createError('cell', 1, 2, `Expected cell to be a positive number but received "{}".`);
		const error7 = parser.createError('cell', 1, 2, `Expected cell to be a positive number but received "[]".`);
		const error8 = parser.createError('cell', 1, 2, `Expected cell to be a positive number but received "NaN".`);

		expect(validate(testData1)).toEqual([error1]);
		expect(validate(testData2)).toEqual([error2]);
		expect(validate(testData3)).toEqual([error3]);
		expect(validate(testData4)).toEqual([error4]);
		expect(validate(testData5)).toEqual([error5]);
		expect(validate(testData6)).toEqual([error6]);
		expect(validate(testData7)).toEqual([error7]);
		expect(validate(testData8)).toEqual([error8]);
	});

	it('should return an array with row type error when the number of cells is less than 3', () => {
		const testData1 = `Product name, Price, Quantity
		Exapmle product0, 4536, 232466,
		`;
		const testData2 = `Product name, Price, Quantity
		Exapmle product0, 4536, 232466,
		'xdh',23,35634,4366342,'vhd,'fghdt54',`;
		const error1 = parser.createError('row', 2, -1, `Expected row to have 3 cells but received 1.`);
		const error2 = parser.createError('row', 2, -1, `Expected row to have 3 cells but received 6.`);

		expect(validate(testData1)).toEqual([error1]);
		expect(validate(testData2)).toEqual([error2]);
	});

	it('should return an array with cell type error when empty string is in a cell', () => {
		const testData = `Product name, Price, Quantity
		Exapmle product0, 4536, 232466,
		, 89974.00, 45`;
		const error = parser.createError('cell', 2, 0, `Expected cell to be a nonempty string but received "".`);

		expect(validate(testData)).toEqual([error]);
	});

	it('should return an array with header type error when header value in a cell doesn\'t much', () => {
		const testData = `Product name, Price, Amount
		Exapmle product0, 4536, 232466,
		Example product1, 89974.00, 356345`;
		const error = parser.createError('header', 0,  2, 'Expected header to be named "Quantity" but received Amount.');

		expect(validate(testData)).toEqual([error]);
	});

	it('should return an empty array when all input lines pass the validation', () => {
		const testData = `Product name, Price, Quantity 
		Exapmle product0, 4536, 232466,
		Example product1, 89974.00, 356345`;

		expect(validate(testData)).toEqual([]);
	});
});

describe('CartParser - integration test', () => {
	it('should return an object when data from file is valid', () => {
		const path = 'samples/cart.csv';
		const expectedResult = {
			items: [
				{ id: expect.anything(), name: "Mollis consequat", price: 9.00, quantity: 2 },
				{ id: expect.anything(), name: "Tvoluptatem", price: 10.32, quantity: 1 },
				{ id: expect.anything(), name: "Scelerisque lacinia", price: 18.90, quantity: 1 },
				{ id: expect.anything(), name: "Consectetur adipiscing", price: 28.72, quantity: 10 },
				{ id: expect.anything(), name: "Condimentum aliquet", price: 13.90, quantity: 1 }
			],
			total: 348.32
		};

		const result = parse(path);

		expect(result).toEqual(expectedResult);
			
	});
	
});