import css from './calculator.module.css';

export const Calculator = () => {
    return (
        <div className={css.calculator}>
            <div className={css.display}>0</div>
            <div className={css.keypad}>
                {/* Buttons will go here */}
            </div>
        </div>
    );
};
