export interface StepConfig { }
export interface StepResult { }

export interface Step<Conf extends StepConfig> {
    Do(config: Conf): StepResult;
    Undo(config: Conf): StepResult;
    Update(config: Conf): StepResult;
}